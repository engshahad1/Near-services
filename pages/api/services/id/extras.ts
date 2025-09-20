// pages/api/services/[id]/extras.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

// نخليها string[] بس، بدون keyof any عشان ما يطلع لنا symbol
const ALLOWED_FIELDS = ['title', 'description', 'price', 'isActive'] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query as { id: string }; // serviceId

  try {
    if (!id) {
      return res.status(400).json({ ok: false, error: 'serviceId مطلوب.' });
    }

    if (req.method === 'GET') {
      // رجّع كل الإضافات التابعة للخدمة
      const extras = await prisma.serviceExtra.findMany({
        where: { serviceId: id },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ ok: true, data: extras });
    }

    if (req.method === 'POST') {
      // إنشاء Extra جديد
      const body = req.body ?? {};
      const payload: Record<string, any> = {};

      for (const field of ALLOWED_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          payload[field] = (body as any)[field];
        }
      }

      // تحقق الحقول الأساسية
      if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
        return res.status(400).json({ ok: false, error: 'title مطلوب.' });
      }

      // price
      let price = 0;
      if (payload.price != null) {
        const n = Number(payload.price);
        if (Number.isNaN(n) || n < 0) {
          return res.status(400).json({ ok: false, error: 'price غير صالح.' });
        }
        price = n;
      }

      // isActive
      let isActive = true;
      if (typeof payload.isActive !== 'undefined') {
        isActive =
          typeof payload.isActive === 'string'
            ? payload.isActive.toLowerCase() === 'true'
            : Boolean(payload.isActive);
      }

      // نبني data صريحًا عشان يرضى Prisma typings
      const extra = await prisma.serviceExtra.create({
        data: {
          serviceId: id,
          title: payload.title,
          description: payload.description ?? null,
          price,
          isActive,
        },
      });

      return res.status(201).json({ ok: true, data: extra });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('services/[id]/extras error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
