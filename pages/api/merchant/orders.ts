// pages/api/merchant/orders.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { OrderStatus } from '@prisma/client';

type Resp = { ok: true; data: any } | { ok: false; error: string };

function getMerchantId(req: NextApiRequest) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)merchantId=([^;]+)/);
  return match?.[1];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  const merchantId = getMerchantId(req);
  if (!merchantId) return res.status(401).json({ ok: false, error: 'غير مسجّل دخول' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // لو كانت الطلبات تُسند لمحل معيّن:
    // const where = { providerId: merchantId, status: { in: [OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.PENDING] } };

    // للـ Demo فقط: نجيب آخر الطلبات المعيّنة لأي محل
    const where = { status: { in: [OrderStatus.ASSIGNED, OrderStatus.PENDING, OrderStatus.CONFIRMED] } };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        service: { select: { id: true, name: true } },
        address: { select: { address: true, city: true, district: true } },
      },
    });

    return res.status(200).json({ ok: true, data: orders });
  } catch (e) {
    console.error('merchant/orders GET error', e);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
