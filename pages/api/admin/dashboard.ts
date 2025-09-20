import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

function assertAdmin(req: NextApiRequest) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return true; // dev
  return req.headers['x-admin-token'] === token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }
    if (!assertAdmin(req)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const now = new Date();
    const d1 = new Date(now); d1.setDate(d1.getDate() - 1);
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);

    const [
      usersCount,
      providersCount,
      servicesCount,
      ordersCount,
      revenueToday,
      revenue7d,
      revenue30d,
      ordersByStatusRaw,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.service.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { finalAmount: true }, where: { createdAt: { gte: d1 } } }),
      prisma.order.aggregate({ _sum: { finalAmount: true }, where: { createdAt: { gte: d7 } } }),
      prisma.order.aggregate({ _sum: { finalAmount: true }, where: { createdAt: { gte: d30 } } }),
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderNumber: true, status: true, finalAmount: true, createdAt: true,
          user: { select: { id: true, name: true } },
          service: { select: { id: true, name: true } },
          provider: { select: { id: true, name: true } },
        },
      }),
    ]);

    const ordersByStatus: { status: string; count: number }[] = [];
    for (const s of ordersByStatusRaw) {
      ordersByStatus.push({ status: s.status, count: s._count._all });
    }

    return res.status(200).json({
      ok: true,
      data: {
        counts: {
          users: usersCount,
          providers: providersCount,
          services: servicesCount,
          orders: ordersCount,
        },
        revenue: {
          today: revenueToday._sum.finalAmount ?? 0,
          last7d: revenue7d._sum.finalAmount ?? 0,
          last30d: revenue30d._sum.finalAmount ?? 0,
        },
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (err: any) {
    console.error('admin/dashboard error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
