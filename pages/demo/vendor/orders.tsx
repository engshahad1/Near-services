// pages/demo/vendor/orders.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, getProviderId } from '@/lib/demoClient';

type Order = {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'ON_WAY' | 'COMPLETED' | string;
  finalAmount: number;
};

const STATUS_FLOW: Order['status'][] = ['PENDING', 'CONFIRMED', 'ON_WAY', 'COMPLETED'];

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'قيد المعالجة',
  CONFIRMED: 'تم التأكيد',
  ON_WAY: 'في الطريق',
  COMPLETED: 'مكتمل',
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  ON_WAY: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
};

export default function VendorOrders() {
  const providerId = getProviderId();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const load = async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ items: Order[] }>(`/api/orders?providerId=${providerId}`);
      setOrders(res.items || []);
    } catch (e: any) {
      setError(e?.message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [providerId]);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  const updateStatus = async (id: string, next: Order['status']) => {
    try {
      setUpdatingId(id);
      // تحديث متفائل بسيط
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: next } : o))
      );
      await api(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
    } catch (e) {
      // رجوع للحالة الأصلية بإعادة التحميل
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStep = (status: Order['status']) => {
    const idx = STATUS_FLOW.indexOf(status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  if (!providerId) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold mb-2">طلبات المحل</h1>
        <p className="text-sm text-red-600 mb-4">لا يوجد Provider محدد لهذا الديمو.</p>
        <Link href="/demo/vendor" className="underline text-blue-600">← رجوع</Link>
      </div>
    );
  }

  return (
    <main className="light-page mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">طلبات المحل</h1>
          <p className="text-sm text-gray-600">إدارة وتتبع حالات الطلبات لهذا المتجر.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            <option value="ALL">كل الحالات</option>
            {STATUS_FLOW.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
            ))}
          </select>
          <button
            onClick={load}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? 'جاري التحديث…' : 'تحديث'}
          </button>
          <Link href="/demo/vendor" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">رجوع</Link>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">لا توجد طلبات.</p>
      ) : (
        <section className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">المبلغ</th>
                <th className="px-4 py-3 w-48">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const next = nextStep(o.status);
                const badgeClass = STATUS_CLASS[o.status] || 'bg-gray-50 text-gray-700 border-gray-200';
                return (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${badgeClass}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{o.finalAmount} <span className="text-gray-500">SAR</span></td>
                    <td className="px-4 py-3">
                      {next ? (
                        <button
                          onClick={() => updateStatus(o.id, next)}
                          disabled={!!updatingId}
                          className={`rounded-xl border px-3 py-2 text-xs hover:bg-gray-50 ${updatingId ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {updatingId === o.id ? 'جاري التحديث…' : `التالي → ${STATUS_LABEL[next] ?? next}`}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">مكتمل</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
