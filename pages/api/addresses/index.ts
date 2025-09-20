// pages/api/addresses/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
type ApiResponse = Ok<any> | Err;

const ALLOWED_CREATE_FIELDS = [
  'userId',
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
  try {
    /**
     * GET /api/addresses
     * Query:
     *  - page, pageSize
     *  - userId (فلترة لعناوين مستخدم محدد)
     *  - isDefault (true/false)
     *  - q (بحث في العنوان/الحي/المدينة/العنوان النصي)
     */
    if (req.method === 'GET') {
      const {
        page = '1',
        pageSize = '10',
        userId,
        isDefault,
        q,
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
      const skip = (pageNum - 1) * take;

      const where: Prisma.AddressWhereInput = {};

      if (userId) where.userId = userId;

      if (typeof isDefault !== 'undefined') {
        const b = toBool(isDefault);
        if (typeof b !== 'undefined') where.isDefault = b;
      }

      if (q) {
        // بدون mode لتوافق الإصدارات
        where.OR = [
          { title:   { contains: q } },
          { address: { contains: q } },
          { city:    { contains: q } },
          { district:{ contains: q } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.address.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        }),
        prisma.address.count({ where }),
      ]);

      return res.status(200).json({
        ok: true,
        data: {
          items,
          pagination: {
            page: pageNum,
            pageSize: take,
            total,
            totalPages: Math.ceil(total / take),
          },
        },
      });
    }

    /**
     * POST /api/addresses
     * Body:
     *  - userId (مطلوب)
     *  - title (مطلوب)
     *  - address (مطلوب)
     *  - building?, apartment?, city?, district?, latitude?, longitude?, isDefault?
     *
     * ملاحظة: إذا isDefault=true → نخلي باقي عناوين نفس المستخدم isDefault=false (داخل Transaction)
     */
    if (req.method === 'POST') {
      const body = (req.body ?? {}) as Record<string, any>;
      const payload: Record<string, any> = {};

      for (const k of ALLOWED_CREATE_FIELDS) {
        if (k in body) payload[k] = body[k as keyof typeof body];
      }

      // تحقق أساسي
      const userId: string | undefined = payload.userId;
      const title: string | undefined = payload.title;
      const addr: string | undefined = payload.address;

      if (!userId) return res.status(400).json({ ok: false, error: 'userId مطلوب.' });
      if (!title || !String(title).trim()) return res.status(400).json({ ok: false, error: 'title مطلوب.' });
      if (!addr  || !String(addr).trim())  return res.status(400).json({ ok: false, error: 'address مطلوب.' });

      // تحقق المستخدم موجود
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) return res.status(404).json({ ok: false, error: 'المستخدم غير موجود.' });

      const lat = toFloat(payload.latitude);
      const lng = toFloat(payload.longitude);
      const isDefaultParsed = typeof payload.isDefault !== 'undefined' ? toBool(payload.isDefault) : false;

      // Transaction: لو isDefault=true نلغي الافتراضيات القديمة
      const created = await prisma.$transaction(async (tx) => {
        if (isDefaultParsed) {
          await tx.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }

        const data: Prisma.AddressCreateInput = {
          title: String(title).trim(),
          address: String(addr).trim(),
          building: payload.building ? String(payload.building) : null,
          apartment: payload.apartment ? String(payload.apartment) : null,
          city: payload.city ? String(payload.city) : undefined, // سكيمة عندك فيها default "الرياض"
          district: payload.district ? String(payload.district) : null,
          latitude: typeof lat === 'number' ? lat : null,
          longitude: typeof lng === 'number' ? lng : null,
          isDefault: Boolean(isDefaultParsed),
          user: { connect: { id: userId } },
        };

        return tx.address.create({
          data,
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        });
      });

      return res.status(201).json({ ok: true, data: created });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('addresses/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
