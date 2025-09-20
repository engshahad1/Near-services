// pages/api/services/[id]/index.ts  ← أو pages/api/services/[id].ts مع تعديل مسار prisma
import type { NextApiRequest, NextApiResponse } from 'next';
import { ServiceType, Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const ALLOWED_FIELDS_FOR_UPDATE = [
  'name',
  'description',
  'price',
  'durationMinutes',
  'categoryId',
  'imageUrl',
  'isActive',
  'type',
  'metadata',
] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query as { id: string };

  try {
    if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

    // ======= GET /api/services/:id =======
    if (req.method === 'GET') {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          extras: true,
          providedBy: {
            select: {
              providerId: true,
              provider: { select: { id: true, name: true, status: true, isActive: true } },
            },
          },
          _count: { select: { orders: true, extras: true, providedBy: true } },
        },
      });

      if (!service) return res.status(404).json({ ok: false, error: 'الخدمة غير موجودة.' });
      return res.status(200).json({ ok: true, data: service });
    }

    // ======= PATCH /api/services/:id =======
    if (req.method === 'PATCH') {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const data: Prisma.ServiceUpdateInput = {};

      for (const key of ALLOWED_FIELDS_FOR_UPDATE) {
        if (key in body) {
          (data as any)[key] = body[key];
        }
      }

      // تحقّقات بسيطة
      if ('name' in data && (typeof data.name !== 'string' || !String(data.name).trim())) {
        return res.status(400).json({ ok: false, error: 'name غير صالح.' });
      }

      if ('price' in data) {
        const n = Number(data.price);
        if (Number.isNaN(n) || n < 0) return res.status(400).json({ ok: false, error: 'price غير صالح.' });
        data.price = n;
      }

      if ('durationMinutes' in data) {
        const d = Number(data.durationMinutes);
        if (!Number.isInteger(d) || d <= 0) {
          return res.status(400).json({ ok: false, error: 'durationMinutes يجب أن يكون عددًا صحيحًا موجبًا.' });
        }
        data.durationMinutes = d;
      }

      if ('isActive' in data) {
        if (typeof data.isActive === 'string') {
          data.isActive = (data.isActive as unknown as string).toLowerCase() === 'true';
        } else {
          data.isActive = Boolean(data.isActive);
        }
      }

      if ('type' in data) {
        const t = String(data.type);
        const allowed = Object.values(ServiceType) as string[];
        if (!allowed.includes(t)) {
          return res.status(400).json({ ok: false, error: `type غير صالح. المسموح: ${allowed.join(', ')}` });
        }
        data.type = t as ServiceType;
      }

      // تحديث الخدمة
      const updated = await prisma.service.update({
        where: { id },
        data,
        include: {
          extras: true,
          providedBy: {
            select: {
              providerId: true,
              provider: { select: { id: true, name: true, status: true, isActive: true } },
            },
          },
        },
      });

      return res.status(200).json({ ok: true, data: updated });
    }

    // ======= DELETE /api/services/:id =======
    if (req.method === 'DELETE') {
      // حماية خفيفة: منع الحذف إن كان فيه طلبات مرتبطة
      const withCounts = await prisma.service.findUnique({
        where: { id },
        select: { _count: { select: { orders: true } } },
      });

      if (!withCounts) return res.status(404).json({ ok: false, error: 'الخدمة غير موجودة.' });
      if (withCounts._count.orders > 0) {
        return res.status(400).json({ ok: false, error: 'لا يمكن حذف خدمة مرتبطة بطلبات. عطّلها بدل الحذف.' });
      }

      // حذف العلاقات الفرعية أولاً (extras / providerServices) لتفادي قيود FK
      await prisma.$transaction([
        prisma.serviceExtra.deleteMany({ where: { serviceId: id } }),
        prisma.providerService.deleteMany({ where: { serviceId: id } }),
        prisma.service.delete({ where: { id } }),
      ]);

      return res.status(200).json({ ok: true, data: { id, deleted: true } });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('services/[id] error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
