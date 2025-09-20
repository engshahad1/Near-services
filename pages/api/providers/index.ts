// pages/api/providers/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const ALLOWED_FIELDS_FOR_CREATE = [
  'name',
  'email',
  'phone',
  'avatarUrl',
  'bio',
  'rating',
  'isActive',
  'location',
  'metadata',
] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    // ========================= GET =========================
    if (req.method === 'GET') {
      const {
        page = '1',
        pageSize = '10',
        q,
        isActive,
        minRating,
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
      const skip = (pageNum - 1) * take;

      const where: Prisma.ProviderWhereInput = {};

      if (q) {
        // بدون mode لتوافق الإصدارات
        where.OR = [
          { name:  { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { id:    { equals: q } },
          // بحث مبسّط على اسم المستخدم المرتبط (بدون mode)
          { user: { name: { contains: q } } },
        ];
      }

      if (typeof isActive !== 'undefined' && ['true', 'false'].includes(isActive.toLowerCase())) {
        where.isActive = isActive.toLowerCase() === 'true';
      }

      if (typeof minRating !== 'undefined') {
        const r = Number(minRating);
        if (!Number.isNaN(r)) where.rating = { gte: r };
      }

      const [items, total] = await Promise.all([
        prisma.provider.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, role: true } },
            _count: { select: { orders: true, services: true, reviews: true } },
          },
        }),
        prisma.provider.count({ where }),
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

    // ========================= POST =========================
    if (req.method === 'POST') {
      const body = req.body ?? {};
      const payload: Record<string, any> = {};

      const userId: string | undefined = body.userId;
      if (!userId) return res.status(400).json({ ok: false, error: 'userId مطلوب لربط مقدم الخدمة بالمستخدم.' });

      // تأكد المستخدم موجود
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) return res.status(404).json({ ok: false, error: 'المستخدم غير موجود.' });

      // تأكد ما عنده Provider سابق (userId فريد)
      const existing = await prisma.provider.findUnique({ where: { userId } });
      if (existing) return res.status(400).json({ ok: false, error: 'يوجد مقدم خدمة مرتبط بهذا المستخدم مسبقًا.' });

      for (const k of ALLOWED_FIELDS_FOR_CREATE) {
        if (k in body) payload[k] = body[k as keyof typeof body];
      }

      // تحققات أساسية
      if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
        return res.status(400).json({ ok: false, error: 'name مطلوب.' });
      }

      if (payload.email && typeof payload.email !== 'string') {
        return res.status(400).json({ ok: false, error: 'email غير صالح.' });
      }

      if (payload.rating != null) {
        const r = Number(payload.rating);
        if (Number.isNaN(r) || r < 0 || r > 5) {
          return res.status(400).json({ ok: false, error: 'rating يجب أن يكون بين 0 و 5.' });
        }
        payload.rating = r;
      } else {
        payload.rating = 0;
      }

      if (typeof payload.isActive !== 'undefined') {
        payload.isActive =
          typeof payload.isActive === 'string'
            ? payload.isActive.toLowerCase() === 'true'
            : Boolean(payload.isActive);
      } else {
        payload.isActive = true;
      }

      // نبني data مطابق تمامًا لنوع ProviderCreateInput
      const data: Prisma.ProviderCreateInput = {
        name: payload.name,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        avatarUrl: payload.avatarUrl ?? null,
        bio: payload.bio ?? null,
        rating: payload.rating,
        isActive: payload.isActive,
        location: payload.location ?? null,
        metadata: (payload.metadata ?? undefined) as any,
        user: { connect: { id: userId } },
      };

      const provider = await prisma.provider.create({
        data,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        },
      });

      return res.status(201).json({ ok: true, data: provider });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('providers/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
