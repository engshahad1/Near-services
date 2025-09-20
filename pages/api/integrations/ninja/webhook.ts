// pages/api/integrations/ninja/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

type Resp = { ok: true; data: any } | { ok: false; error: string };

/**
 * payload متوقعة:
 * {
 *   externalId: "ninja_....",
 *   event: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED",
 *   note?: string
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const secret = req.headers['x-delivery-secret'];
    if (secret !== (process.env.DELIVERY_CALLBACK_SECRET || 'your-random-delivery-callback-token')) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { externalId, event, note } = req.body ?? {};
    if (!externalId || !event) return res.status(400).json({ ok: false, error: 'externalId & event مطلوبة' });

    // نلقى الـDelivery
    const delivery = await prisma.delivery.findFirst({ where: { externalId } });
    if (!delivery) return res.status(404).json({ ok: false, error: 'delivery غير موجود' });

    // خريطة حالات
    const map: Record<string, DeliveryStatus> = {
      ASSIGNED: DeliveryStatus.ASSIGNED,
      PICKED_UP: DeliveryStatus.PICKED_UP,
      IN_TRANSIT: DeliveryStatus.IN_TRANSIT,
      DELIVERED: DeliveryStatus.DELIVERED,
      FAILED: DeliveryStatus.FAILED,
    };
    const dStatus = map[String(event).toUpperCase()];
    if (!dStatus) return res.status(400).json({ ok: false, error: 'event غير مدعوم' });

    // نحدّث التوصيل + الطلب + السجل
    const updated = await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { orderId: delivery.orderId },
        data: { status: dStatus },
      });

      // تحديث طلب بناءً على الحدث
      let oStatus: OrderStatus | null = null;
      if (dStatus === DeliveryStatus.PICKED_UP) oStatus = OrderStatus.ON_WAY;
      if (dStatus === DeliveryStatus.IN_TRANSIT) oStatus = OrderStatus.ON_WAY;
      if (dStatus === DeliveryStatus.DELIVERED) oStatus = OrderStatus.COMPLETED;
      if (dStatus === DeliveryStatus.FAILED) oStatus = OrderStatus.CANCELLED;

      if (oStatus) {
        await tx.order.update({ where: { id: delivery.orderId }, data: { status: oStatus } });
        await tx.orderStatusHistory.create({
          data: { orderId: delivery.orderId, status: oStatus, notes: note ?? `Update via Ninja: ${event}` },
        });
      }

      return tx.order.findUnique({
        where: { id: delivery.orderId },
        include: { delivery: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
      });
    });

    return res.status(200).json({ ok: true, data: updated });
  } catch (e) {
    console.error('ninja/webhook error', e);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
