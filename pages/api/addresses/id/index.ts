// pages/api/addresses/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
type ApiResponse = Ok<any> | Err;

const ALLOWED_UPDATE_FIELDS = [
  'title',
  'address',
  'building',
  'apartment',
  'city',
  'district',
  'latitude',
  'longitude',
  'isDefault',
] as const;

function toBool(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return undefined;
}

function toFloat(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query as { id: string };

  try {
    if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

    /**
     * GET /api/addresses/:id
     * يرجّع العنوان مع بيانات المستخدم المرتبط
     */
    if (req.method === 'GET') {
      const address = await prisma.address.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      });

      if (!address) return res.status(404).json({ ok: false, error: 'العنوان غير موجود.' });
      return res.status(200).json({ ok: true, data: address });
    }

    /**
     * PUT /api/addresses/:id
     * تحديث حقول العنوان. لو isDefault=true → نلغي الافتراضيات الأخرى لنفس المستخدم.
     */
    if (req.method === 'PUT') {
      const body = (req.body ?? {}) as Record<string, any>;

      // نقرأ العنوان الحالي لنستفيد من userId + نتحقق من الوجود
      const current = await prisma.address.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!current) return res.status(404).json({ ok: false, error: 'العنوان غير موجود.' });

      // نبني Payload مُحقق النوع
      const patch: Record<string, any> = {};
      for (const k of ALLOWED_UPDATE_FIELDS) {
        if (!(k in body)) continue;
        patch[k] = body[k as keyof typeof body];
      }

      // تحققات
      if ('title' in patch && (!patch.title || !String(patch.title).trim())) {
        return res.status(400).json({ ok: false, error: 'title غير صالح.' });
      }
      if ('address' in patch && (!patch.address || !String(patch.address).trim())) {
        return res.status(400).json({ ok: false, error: 'address غير صالح.' });
      }

      let lat: number | undefined;
      let lng: number | undefined;
      if ('latitude' in patch) {
        const n = toFloat(patch.latitude);
        if (typeof n === 'undefined') return res.status(400).json({ ok: false, error: 'latitude غير صالح.' });
        lat = n;
      }
      if ('longitude' in patch) {
        const n = toFloat(patch.longitude);
        if (typeof n === 'undefined') return res.status(400).json({ ok: false, error: 'longitude غير صالح.' });
        lng = n;
      }

      let isDefaultParsed: boolean | undefined;
      if ('isDefault' in patch) {
        const b = toBool(patch.isDefault);
        if (typeof b === 'undefined') return res.status(400).json({ ok: false, error: 'isDefault غير صالح.' });
        isDefaultParsed = b;
      }

      if (
        !('title' in patch) &&
        !('address' in patch) &&
        !('building' in patch) &&
        !('apartment' in patch) &&
        !('city' in patch) &&
        !('district' in patch) &&
        typeof lat === 'undefined' &&
        typeof lng === 'undefined' &&
        typeof isDefaultParsed === 'undefined'
      ) {
        return res.status(400).json({ ok: false, error: 'لا توجد حقول صالحة للتحديث.' });
      }

      // Transaction: لو صار isDefault=true نزّل الباقي false
      const updated = await prisma.$transaction(async (tx) => {
        if (isDefaultParsed === true) {
          await tx.address.updateMany({
            where: { userId: current.userId },
            data: { isDefault: false },
          });
        }

        const data: Prisma.AddressUpdateInput = {
          ...(patch.title != null ? { title: String(patch.title).trim() } : {}),
          ...(patch.address != null ? { address: String(patch.address).trim() } : {}),
          ...(patch.building !== undefined ? { building: patch.building ? String(patch.building) : null } : {}),
          ...(patch.apartment !== undefined ? { apartment: patch.apartment ? String(patch.apartment) : null } : {}),
          ...(patch.city !== undefined ? { city: patch.city ? String(patch.city) : undefined } : {}),
          ...(patch.district !== undefined ? { district: patch.district ? String(patch.district) : null } : {}),
          ...(typeof lat === 'number' ? { latitude: lat } : {}),
          ...(typeof lng === 'number' ? { longitude: lng } : {}),
          ...(typeof isDefaultParsed === 'boolean' ? { isDefault: isDefaultParsed } : {}),
        };

        const saved = await tx.address.update({
          where: { id: current.id },
          data,
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        });

        return saved;
      });

      return res.status(200).json({ ok: true, data: updated });
    }

    /**
     * DELETE /api/addresses/:id
     * حذف آمن: يمنع الحذف إذا كان العنوان مرتبطًا بطلبات (تفادي كسر العلاقات).
     */
    if (req.method === 'DELETE') {
      const address = await prisma.address.findUnique({
        where: { id },
        include: { _count: { select: { orders: true } } },
      });
      if (!address) return res.status(404).json({ ok: false, error: 'العنوان غير موجود.' });

      if (address._count.orders > 0) {
        // في حال عندك طلبات مرتبطة، يُفضّل منع الحذف الصريح
        return res
          .status(409)
          .json({ ok: false, error: 'لا يمكن حذف العنوان لأنه مرتبط بطلبات. أنشئ عنوانًا جديدًا واجعله الافتراضي.' });
      }

      await prisma.address.delete({ where: { id } });
      return res.status(200).json({ ok: true, data: { id, deleted: true } });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('addresses/[id]/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
