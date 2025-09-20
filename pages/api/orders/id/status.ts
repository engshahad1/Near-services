// pages/api/orders/[id]/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OrderStatus, DeliveryStatus } from '@prisma/client';
import prisma from '../../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

// حالات منتهية لا يُسمح بتعديلها
const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
]);

// الانتقالات المسموحة
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]:     [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]:   [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]:    [OrderStatus.ON_WAY, OrderStatus.CANCELLED],
  [OrderStatus.ON_WAY]:      [OrderStatus.ARRIVED, OrderStatus.CANCELLED],
  [OrderStatus.ARRIVED]:     [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]:   [],
  [OrderStatus.CANCELLED]:   [],
  [OrderStatus.REFUNDED]:    [],
};

function mapOrderToDeliveryStatus(next: OrderStatus): DeliveryStatus | null {
  switch (next) {
    case OrderStatus.ON_WAY:    return DeliveryStatus.IN_TRANSIT;
    case OrderStatus.ARRIVED:   return DeliveryStatus.PICKED_UP;
    case OrderStatus.COMPLETED: return DeliveryStatus.DELIVERED;
    case OrderStatus.CANCELLED: return DeliveryStatus.FAILED;
    default: return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query as { id: string };

  try {
    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'PUT');
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

    const { status, notes } = (req.body ?? {}) as { status?: OrderStatus | string; notes?: string };

    // تحقق أن القيمة ضمن enum
    if (!status || !(Object.values(OrderStatus) as string[]).includes(String(status))) {
      return res.status(400).json({ ok: false, error: 'status غير صالح.' });
    }
    const nextStatus = status as OrderStatus;

    // اقرأ الطلب الحالي
    const current = await prisma.order.findUnique({
      where: { id },
      include: { delivery: true },
    });
    if (!current) return res.status(404).json({ ok: false, error: 'الطلب غير موجود.' });

    // لا نسمح بتعديل طلب منتهي/ملغي
    if (TERMINAL_STATUSES.has(current.status)) {
      return res.status(400).json({ ok: false, error: 'لا يمكن تعديل حالة طلب منتهي أو ملغي.' });
    }

    // تحقق من الانتقال المسموح
    const allowedNext = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!(allowedNext as OrderStatus[]).includes(nextStatus)) {
      return res.status(400).json({
        ok: false,
        error: `لا يمكن الانتقال من ${current.status} إلى ${nextStatus}. المسموح: ${allowedNext.join(', ') || 'لا شيء'}`,
      });
    }

    // Transaction: تحديث الطلب + history + (اختياري) التوصيل
    const updatedWithRelations = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: current.id },
        data: { status: nextStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: updated.id,
          status: nextStatus,
          notes: notes ?? `Status changed via API from ${current.status} to ${nextStatus}`,
        },
      });

      if (current.delivery) {
        const mapped = mapOrderToDeliveryStatus(nextStatus);
        if (mapped) {
          await tx.delivery.update({
            where: { orderId: current.id },
            data: { status: mapped },
          });
        }
      }

      return tx.order.findUnique({
        where: { id: updated.id },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          service: { select: { id: true, name: true } },
          provider: { select: { id: true, name: true } },
          address: true,
          payment: true,
          delivery: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    return res.status(200).json({ ok: true, data: updatedWithRelations });
  } catch (err) {
    console.error('orders/[id]/status error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
