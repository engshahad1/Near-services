// pages/api/integrations/ninja/create-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { createOrder as ninjaCreate } from '../../../../lib/integrations/ninja';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

type Resp = { ok: true; data: any } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { orderId } = req.body ?? {};
    if (!orderId) return res.status(400).json({ ok: false, error: 'orderId مطلوب' });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, phone: true } },
        address: true,
      },
    });
    if (!order) return res.status(404).json({ ok: false, error: 'الطلب غير موجود' });

    // ✅ ثبّت شركة Ninja بـ id معروف (بدون استخدام nameEn كـ where)
    const company = await prisma.deliveryCompany.upsert({
      where: { id: 'ninja' }, // لازم يكون فريد في جدولك
      update: {
        name: 'نينجا',
        nameEn: 'Ninja',
        apiEndpoint: 'https://api.ninja.local/mock',
        apiKey: process.env.NINJA_API_KEY || 'demo',
        isActive: true,
      },
      create: {
        id: 'ninja',
        name: 'نينجا',
        nameEn: 'Ninja',
        apiEndpoint: 'https://api.ninja.local/mock',
        apiKey: process.env.NINJA_API_KEY || 'demo',
        isActive: true,
      },
    });

    // نداء الـ API الوهمي اللي عندنا
    const ninjaResp = await ninjaCreate({
      orderId,
      pickupAddress: 'مستودع الشركة - الرياض',
      dropoffAddress: order.address.address,
      recipientName: order.user.name || 'عميل',
      recipientPhone: order.user.phone || '',
    });

    // حفظ معلومات التوصيل + تحديث حالة الطلب
    const saved = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.upsert({
        where: { orderId },
        update: {
          companyId: company.id,
          externalId: ninjaResp.externalId,
          pickupAddress: 'مستودع الشركة - الرياض',
          deliveryAddress: order.address.address,
          status: DeliveryStatus.ASSIGNED,
          trackingUrl: ninjaResp.trackingUrl,
        },
        create: {
          orderId,
          companyId: company.id,
          externalId: ninjaResp.externalId,
          pickupAddress: 'مستودع الشركة - الرياض',
          deliveryAddress: order.address.address,
          status: DeliveryStatus.ASSIGNED,
          trackingUrl: ninjaResp.trackingUrl,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.ASSIGNED },
      });

      await tx.orderStatusHistory.create({
        data: { orderId, status: OrderStatus.ASSIGNED, notes: 'Assigned to Ninja' },
      });

      return delivery;
    });

    return res.status(200).json({ ok: true, data: saved });
  } catch (e) {
    console.error('ninja/create-order error', e);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}