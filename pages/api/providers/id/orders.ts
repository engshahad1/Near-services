import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query as { id: string };

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

    const {
      page = '1',
      pageSize = '10',
      status,
      q,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * take;

    const where: any = { providerId: id };
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { address: { contains: q, mode: 'insensitive' } },
        { notes:   { contains: q, mode: 'insensitive' } },
        { id:      { equals: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
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
  } catch (err: any) {
    console.error('providers/[id]/orders error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
