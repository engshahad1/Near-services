// pages/demo/vendor/services.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, getProviderId } from '@/lib/demoClient';

type Service = { id: string; name: string; price?: number | null };

export default function VendorServices() {
  const providerId = getProviderId();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: '1',
        pageSize: '50',
        ...(providerId ? { providerId: String(providerId) } : {}),
      });
      const res = await api<{ items: Service[] }>(`/api/services?${qs.toString()}`);
      setServices(res.items || []);
    } catch (e: any) {
      setError(e?.message || 'فشل تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [providerId]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return services;
    return services.filter(s => s.name?.toLowerCase().includes(term));
  }, [services, q]);

  const canSave = name.trim().length > 0 && !Number.isNaN(Number(price)) && Number(price) >= 0;

  const add = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      await api('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          ...(providerId ? { providerId } : {}),
        }),
      });
      setName('');
      setPrice('0');
      await load();
    } catch (e: any) {
      setError(e?.message || 'فشل إضافة الخدمة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="light-page mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">الخدمات</h1>
          <p className="text-sm text-gray-600">
            أضف خدماتك وشاهد القائمة الحالية. {providerId ? null : <span className="text-red-600">⚠️ لا يوجد Provider محدد.</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="بحث باسم الخدمة…"
            className="rounded-xl border px-3 py-2 text-sm"
          />
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

      <section className="mb-6 rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">إضافة خدمة جديدة</h2>
        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="اسم الخدمة"
            className="rounded-xl border px-3 py-2"
          />
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="السعر"
            type="number"
            min={0}
            className="rounded-xl border px-3 py-2"
          />
          <button
            onClick={add}
            disabled={!canSave || saving}
            className={`rounded-xl border px-3 py-2 hover:bg-gray-50 ${(!canSave || saving) ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {saving ? 'جاري الإضافة…' : 'إضافة'}
          </button>
        </div>
        {!canSave && (
          <p className="mt-2 text-xs text-gray-500">تأكدي من إدخال اسم صحيح وسعر ≥ 0.</p>
        )}
      </section>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">لا توجد خدمات.</p>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => (
            <article key={s.id} className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{s.name}</h3>
                <span className="rounded-lg bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                  {typeof s.price === 'number' ? `${s.price} SAR` : '—'}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
