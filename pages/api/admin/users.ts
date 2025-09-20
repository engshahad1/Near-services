import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

function assertAdmin(req: NextApiRequest) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return true;
  return req.headers['x-admin-token'] === token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (!assertAdmin(req)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const {
        page = '1',
        pageSize = '10',
        q,
        role,
        isActive,
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
      const skip = (pageNum - 1) * take;

      const where: any = {};
      if (q) {
        where.OR = [
          { name:  { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { id:    { equals: q } },
        ];
      }
      if (role) where.role = role;
      if (typeof isActive !== 'undefined' && ['true','false'].includes(isActive.toLowerCase())) {
        where.isActive = isActive.toLowerCase() === 'true';
      }

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true,
            provider: { select: { id: true, status: true, isVerified: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        ok: true,
        data: {
          items,
          pagination: { page: pageNum, pageSize: take, total, totalPages: Math.ceil(total / take) },
        },
      });
    }

    if (req.method === 'PATCH') {
      const { id, role, isActive } = req.body ?? {};
      if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

      const data: any = {};
      if (role) data.role = role;
      if (typeof isActive !== 'undefined') data.isActive = Boolean(isActive);

      const updated = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, updatedAt: true },
      });

      return res.status(200).json({ ok: true, data: updated });
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('admin/users error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
