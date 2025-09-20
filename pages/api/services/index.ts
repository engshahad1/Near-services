// pages/api/services/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
type ApiResponse = Ok<any> | Err;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (req.method === 'GET') {
      const {
        page = '1',
        pageSize = '20',
        q,
        categoryId,
        isActive,
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const take = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);
      const skip = (pageNum - 1) * take;

      const where: Prisma.ServiceWhereInput = {};

      if (q) {
        // بدون mode: 'insensitive' لأن نسختك من Prisma لا تدعمه
        where.OR = [
          { name:        { contains: q } },
          { description: { contains: q } },
          { id:          { equals: q } },
        ];
      }

      if (categoryId) where.categoryId = categoryId;

      if (typeof isActive !== 'undefined') {
        if (['true', 'false'].includes(isActive.toLowerCase())) {
          where.isActive = isActive.toLowerCase() === 'true';
        }
      }

      const [items, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take,
          orderBy: { rating: 'desc' }, // الأكثر تقييماً أولاً
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            imageUrl: true,
            type: true,
            rating: true,
            reviewCount: true,
            isActive: true,
            createdAt: true,
          },
        }),
        prisma.service.count({ where }),
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

    if (req.method === 'POST') {
      const body = req.body ?? {};

      // التحقق الأساسي للاسم
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) {
        return res.status(400).json({ ok: false, error: 'name مطلوب.' });
      }

      // price
      const price =
        body.price != null && !Number.isNaN(Number(body.price)) && Number(body.price) >= 0
          ? Number(body.price)
          : 0;

      // durationMinutes (اختياري لكن لو موجود يجب أن يكون رقم صحيح موجب)
      let durationMinutes: number | null = null;
      if (body.durationMinutes != null) {
        const d = Number(body.durationMinutes);
        if (!Number.isInteger(d) || d <= 0) {
          return res.status(400).json({
            ok: false,
            error: 'durationMinutes يجب أن يكون عددًا صحيحًا موجبًا.',
          });
        }
        durationMinutes = d;
      }

      // isActive
      const isActive: boolean =
        typeof body.isActive === 'string'
          ? body.isActive.toLowerCase() === 'true'
          : body.isActive != null
          ? Boolean(body.isActive)
          : true;

      // كائن مطابق لنوع Prisma.ServiceCreateInput
      const createData: Prisma.ServiceCreateInput = {
        name,
        description: body.description ?? null,
        price,
        durationMinutes,                     // nullable
        categoryId: body.categoryId ?? null,
        imageUrl: body.imageUrl ?? null,
        // type: body.type as any,            // إذا تبين تمررين enum ServiceType من الفورم
        isActive,
        // metadata: body.metadata as any,    // لو بتخزنين JSON
      };

      const service = await prisma.service.create({ data: createData });
      return res.status(201).json({ ok: true, data: service });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('services/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
