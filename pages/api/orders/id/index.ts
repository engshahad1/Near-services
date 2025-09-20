import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { OrderStatus } from '@prisma/client';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const ALLOWED_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.ASSIGNED,
  OrderStatus.ON_WAY,
  OrderStatus.ARRIVED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

// ✅ helper يريح تايب سكريبت
const isTerminal = (s: OrderStatus) =>
  s === OrderStatus.COMPLETED || s === OrderStatus.CANCELLED;

function getIdParam(idParam: string | string[] | undefined): string | null {
  if (!idParam) return null;
  return Array.isArray(idParam) ? idParam[0] : idParam;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const id = getIdParam(req.query.id);
  if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

  try {
    // GET /orders/:id
    if (req.method === 'GET') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          service: true,
          provider: { select: { id: true, name: true, phone: true, email: true } },
          address: true,
          items: { include: { serviceExtra: true } },
          payment: true,
          delivery: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (!order) return res.status(404).json({ ok: false, error: 'الطلب غير موجود.' });
      return res.status(200).json({ ok: true, data: order });
    }

    // PATCH /orders/:id
    if (req.method === 'PATCH') {
      const { status: rawStatus, notes, providerId, scheduledAt, addressId } = req.body ?? {};
      const current = await prisma.order.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ ok: false, error: 'الطلب غير موجود.' });

      // ❌ لا نعدل بعد الانتهاء/الإلغاء
      if (isTerminal(current.status)) {
        return res.status(400).json({ ok: false, error: 'لا يمكن تعديل حالة طلب منتهي/ملغي.' });
      }

      const data: any = {};
      if (typeof notes === 'string') data.notes = notes;
      if (typeof providerId === 'string') data.providerId = providerId;
      if (typeof addressId === 'string') data.addressId = addressId;

      if (scheduledAt) {
        const d = new Date(scheduledAt);
        if (isNaN(d.getTime())) return res.status(400).json({ ok: false, error: 'scheduledAt غير صالح.' });
        data.scheduledAt = d;
      }

      let historyToCreate: { status: OrderStatus; notes?: string } | null = null;
      const nextStatus = rawStatus as OrderStatus | undefined;
      if (nextStatus) {
        if (!ALLOWED_STATUSES.includes(nextStatus)) {
          return res.status(400).json({ ok: false, error: 'status غير صالح.' });
        }
        data.status = nextStatus;
        historyToCreate = { status: nextStatus, notes: typeof notes === 'string' ? notes : undefined };
      }

      const updated = await prisma.order.update({
        where: { id },
        data,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          service: true,
          provider: { select: { id: true, name: true, phone: true, email: true } },
          address: true,
          items: { include: { serviceExtra: true } },
          payment: true,
          delivery: true,
          statusHistory: true,
        },
      });

      if (historyToCreate) {
        await prisma.orderStatusHistory.create({
          data: { orderId: id, status: historyToCreate.status, notes: historyToCreate.notes },
        });
      }

      return res.status(200).json({ ok: true, data: updated });
    }

    // DELETE /orders/:id (إلغاء)
    if (req.method === 'DELETE') {
      const { reason } = req.body ?? {};
      const current = await prisma.order.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ ok: false, error: 'الطلب غير موجود.' });

      if (isTerminal(current.status)) {
        return res.status(400).json({ ok: false, error: 'لا يمكن إلغاء طلب منتهي/ملغي.' });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancellationReason: typeof reason === 'string' ? reason : undefined,
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          notes: typeof reason === 'string' ? reason : 'تم إلغاء الطلب',
        },
      });

      return res.status(200).json({ ok: true, data: updated });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('orders/[id] error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}