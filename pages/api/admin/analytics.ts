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

type DailyPoint = { day: string; revenue: number; orders: number };

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
    const from = new Date(now);
    from.setDate(from.getDate() - 30);

    // 1) إحضار الطلبات وتجميع يومي بالذاكرة
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true, finalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const bucket = new Map<string, { revenue: number; orders: number }>();
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      const prev = bucket.get(key) || { revenue: 0, orders: 0 };
      const nextRevenue = prev.revenue + (o.finalAmount ?? 0);
      const nextOrders = prev.orders + 1;
      bucket.set(key, { revenue: nextRevenue, orders: nextOrders });
    }

    const dailyRevenue: DailyPoint[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const val = bucket.get(key) || { revenue: 0, orders: 0 };
      dailyRevenue.push({ day: key, revenue: val.revenue, orders: val.orders });
    }

    // 2) أفضل الخدمات
    const topServices = await prisma.order.groupBy({
      by: ['serviceId'],
      _sum: { finalAmount: true },
      _count: { _all: true },
      orderBy: { _sum: { finalAmount: 'desc' } },
      take: 10,
    });

    const serviceIds: string[] = [];
    for (const s of topServices) {
      serviceIds.push(s.serviceId);
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, price: true },
    });

    const servicesMap = new Map<string, { id: string; name: string; price: number | null }>();
    for (const s of services) {
      servicesMap.set(s.id, { id: s.id, name: s.name, price: s.price ?? null });
    }

    const topServicesResolved: { serviceId: string; serviceName: string; revenue: number; orders: number }[] = [];
    for (const s of topServices) {
      const svc = servicesMap.get(s.serviceId);
      topServicesResolved.push({
        serviceId: s.serviceId,
        serviceName: svc ? svc.name : 'Unknown',
        revenue: s._sum.finalAmount ?? 0,
        orders: s._count._all,
      });
    }

    // 3) أفضل المقدمين
    const topProviders = await prisma.order.groupBy({
      by: ['providerId'],
      where: { status: 'COMPLETED', providerId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 10,
    });

    const providerIds: string[] = [];
    for (const p of topProviders) {
      if (p.providerId) providerIds.push(p.providerId);
    }

    const providers = await prisma.provider.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true, rating: true },
    });

    const providersMap = new Map<string, { id: string; name: string; rating: number | null }>();
    for (const p of providers) {
      providersMap.set(p.id, { id: p.id, name: p.name, rating: p.rating ?? 0 });
    }

    const topProvidersResolved: {
      providerId: string | null;
      providerName: string;
      completedOrders: number;
      rating: number | null;
    }[] = [];
    for (const p of topProviders) {
      if (p.providerId) {
        const pv = providersMap.get(p.providerId);
        topProvidersResolved.push({
          providerId: p.providerId,
          providerName: pv ? pv.name : 'Unknown',
          completedOrders: p._count._all,
          rating: pv ? pv.rating ?? 0 : null,
        });
      } else {
        topProvidersResolved.push({
          providerId: null,
          providerName: 'Unassigned',
          completedOrders: p._count._all,
          rating: null,
        });
      }
    }

    // 4) القمع (Funnel)
    const grouped = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const ordersFunnel: { status: string; count: number }[] = [];
    for (const g of grouped) {
      ordersFunnel.push({ status: g.status, count: g._count._all });
    }

    return res.status(200).json({
      ok: true,
      data: {
        dailyRevenue,
        topServices: topServicesResolved,
        topProviders: topProvidersResolved,
        ordersFunnel,
      },
    });
  } catch (err: any) {
    console.error('admin/analytics error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
