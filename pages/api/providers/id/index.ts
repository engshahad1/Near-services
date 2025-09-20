// pages/api/providers/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma, ProviderStatus } from '@prisma/client';
import prisma from '../../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const ALLOWED_UPDATE_FIELDS = [
  'name',
  'email',
  'phone',
  'avatarUrl',
  'bio',
  'location',
  'isActive',
  'rating',
  'status', // من نوع ProviderStatus
  'metadata',
] as const;

function toBoolean(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query as { id: string };

  try {
    if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

    // GET /providers/:id  => قراءة + علاقات مفيدة
    if (req.method === 'GET') {
      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          services: {
            select: {
              service: { select: { id: true, name: true, price: true, type: true } },
              isActive: true,
            },
          },
          reviews: {
            select: { id: true, rating: true, comment: true, createdAt: true, userId: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!provider) return res.status(404).json({ ok: false, error: 'المقدم غير موجود.' });

      return res.status(200).json({ ok: true, data: provider });
    }

    // PUT /providers/:id  => تحديث حقول مسموح بها فقط
    if (req.method === 'PUT') {
      const body = (req.body ?? {}) as Record<string, any>;

      const data: Prisma.ProviderUpdateInput = {};
      for (const key of ALLOWED_UPDATE_FIELDS) {
        if (!(key in body)) continue;

        switch (key) {
          case 'rating': {
            const n = Number(body.rating);
            if (Number.isNaN(n) || n < 0 || n > 5) {
              return res.status(400).json({ ok: false, error: 'rating يجب أن يكون بين 0 و 5.' });
            }
            data.rating = n;
            break;
          }
          case 'isActive': {
            const b = toBoolean(body.isActive);
            if (typeof b === 'undefined') {
              return res.status(400).json({ ok: false, error: 'isActive غير صالح.' });
            }
            data.isActive = b;
            break;
          }
          case 'status': {
            // تحقّق بسيط لقيم enum
            const s = String(body.status).toUpperCase() as ProviderStatus;
            if (!['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].includes(s)) {
              return res.status(400).json({ ok: false, error: 'status غير صالح.' });
            }
            data.status = s;
            break;
          }
          case 'metadata': {
            data.metadata = body.metadata as Prisma.InputJsonValue;
            break;
          }
          default: {
            // حقول نصية/عادية
            // name, email, phone, avatarUrl, bio, location
            data[key] = body[key];
          }
        }
      }

      // منع تعديل userId هنا (لو احتجته سوّ ملف مخصص)
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ ok: false, error: 'لا توجد حقول صالحة للتحديث.' });
      }

      const updated = await prisma.provider.update({
        where: { id },
        data,
      });

      return res.status(200).json({ ok: true, data: updated });
    }

    // DELETE /providers/:id  => “تعطيل ناعم” بدل الحذف النهائي
    if (req.method === 'DELETE') {
      const updated = await prisma.provider.update({
        where: { id },
        data: {
          isActive: false,
          status: 'SUSPENDED',
        },
      });
      return res.status(200).json({ ok: true, data: updated });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('providers/[id]/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
