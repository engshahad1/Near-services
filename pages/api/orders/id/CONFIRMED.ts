import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { OrderStatus } from '@prisma/client';

type Resp = { ok: true; data: any } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const { id } = req.query as { id: string };
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ ok: false, error: 'الطلب غير موجود' });

    const allowed = ['ASSIGNED', 'PENDING', 'ACCEPTED'] as OrderStatus[];
    if (!allowed.includes(order.status as OrderStatus)) {
      return res.status(400).json({ ok: false, error: 'لا يمكن إلغاء هذه الحالة' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED, cancellationReason: 'رفض من المحل (Demo)' },
      });
      await tx.orderStatusHistory.create({
        data: { orderId: id, status: OrderStatus.CANCELLED, notes: 'Cancelled by merchant (demo)' },
      });
      return o;
    });

    return res.status(200).json({ ok: true, data: updated });
  } catch (e) {
    console.error('orders/[id]/cancel error', e);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
