// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';

// ========== Types ==========
type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
type ApiResponse = Ok<any> | Err;

// مولّد رقم طلب بسيط وفريد
function genOrderNumber() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${dd}-${rand}`;
}

// تقريب مالي بسيط
const round2 = (n: number) => Math.round(n * 100) / 100;

// ========== Handler ==========
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (req.method === 'GET') {
      const {
        page = '1',
        pageSize = '10',
        status,
        userId,
        providerId,
        q,
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
      const skip = (pageNum - 1) * take;

      const where: Prisma.OrderWhereInput = {};

      if (status) where.status = status as any;
      if (userId) where.userId = userId;
      if (providerId) where.providerId = providerId;

      if (q) {
        // نبحث في رقم الطلب + عنوان Address المرتبط
        where.OR = [
          { orderNumber: { contains: q } },
          { address: { is: { address: { contains: q } } } }, // لا نستخدم mode لتوافق الإصدارات
        ];
      }

      const [items, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, phone: true } },
            service: { select: { id: true, name: true, type: true, price: true } },
            provider: { select: { id: true, name: true } },
            address: { select: { id: true, title: true, address: true, city: true } },
            payment: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      return res.status(200).json({
        ok: true,
        data: {
          items,
          pagination: { page: pageNum, pageSize: take, total, totalPages: Math.ceil(total / take) },
        },
      });
    }

    if (req.method === 'POST') {
      /**
       * المتطلبات لإنشاء طلب:
       * - userId, serviceId, addressId (كلها موجودة عندك في السكيمة)
       * - scheduledAt (تاريخ التنفيذ)
       * - paymentMethod (مثلاً: 'card' | 'cash')
       * - totalAmount (إن جاء من الواجهة) أو نحسبه من سعر الخدمة
       *
       * نحسب ضريبة القيمة المضافة 15% ونملأ:
       * - vat, finalAmount, status=PENDING, paymentStatus=PENDING
       */
      const body = req.body ?? {};
      const userId: string | undefined = body.userId;
      const serviceId: string | undefined = body.serviceId;
      const addressId: string | undefined = body.addressId;
      const paymentMethod: string | undefined = body.paymentMethod;
      const notes: string | undefined = body.notes ?? undefined;

      if (!userId) return res.status(400).json({ ok: false, error: 'userId مطلوب.' });
      if (!serviceId) return res.status(400).json({ ok: false, error: 'serviceId مطلوب.' });
      if (!addressId) return res.status(400).json({ ok: false, error: 'addressId مطلوب.' });
      if (!paymentMethod) return res.status(400).json({ ok: false, error: 'paymentMethod مطلوب.' });

      // scheduledAt
      let scheduledAt: Date;
      try {
        scheduledAt = new Date(body.scheduledAt);
        if (Number.isNaN(scheduledAt.getTime())) throw new Error();
      } catch {
        return res.status(400).json({ ok: false, error: 'scheduledAt غير صالح.' });
      }

      // تحقق من وجود الكيانات
      const [user, service, address] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
        prisma.service.findUnique({ where: { id: serviceId } }),
        prisma.address.findUnique({ where: { id: addressId }, select: { id: true } }),
      ]);
      if (!user) return res.status(404).json({ ok: false, error: 'المستخدم غير موجود.' });
      if (!service) return res.status(404).json({ ok: false, error: 'الخدمة غير موجودة.' });
      if (!address) return res.status(404).json({ ok: false, error: 'العنوان غير موجود.' });

      // totalAmount إمّا يأتي من الواجهة أو نأخذه من سعر الخدمة
      let totalAmount = Number(body.totalAmount);
      if (Number.isNaN(totalAmount) || totalAmount < 0) {
        totalAmount = service.price ?? 0;
      }
      totalAmount = round2(totalAmount);

      // VAT 15%
      const vat = round2(totalAmount * 0.15);
      const finalAmount = round2(totalAmount + vat);

      // نبني كائن الإنشاء typed
      const data: Prisma.OrderCreateInput = {
        orderNumber: genOrderNumber(),
        user: { connect: { id: userId } },
        service: { connect: { id: serviceId } },
        address: { connect: { id: addressId } },
        scheduledAt,
        totalAmount,
        vat,
        finalAmount,
        status: 'PENDING',         // OrderStatus
        paymentStatus: 'PENDING',  // PaymentStatus
        paymentMethod,             // string
        notes: notes ?? null,
        // بإمكانك إضافة items أو delivery أو غيرها هنا لاحقًا
      };

      const order = await prisma.order.create({
        data,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          service: { select: { id: true, name: true, type: true, price: true } },
          address: { select: { id: true, title: true, address: true, city: true } },
        },
      });

      return res.status(201).json({ ok: true, data: order });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('orders/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
