// pages/demo/index.tsx
import { useEffect, useState } from 'react';

type OrderRow = {
  id: string;
  orderNumber: string;
  finalAmount: number | null;
  status: 'PENDING' | 'ASSIGNED' | 'CANCELLED' | string;
  createdAt: string;
};

export default function DemoNinjaBoard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/orders?page=1&pageSize=50');
      const j = await r.json();
      const items: OrderRow[] = (j?.data?.items ?? []).map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        finalAmount: o.finalAmount ?? o.totalAmount ?? 0,
        status: o.status,
        createdAt: o.createdAt,
      }));
      setOrders(items);
    } catch (e) {
      console.error(e);
      setMsg('تعذر تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function assignToNinja(orderId: string) {
    try {
      const r = await fetch('/api/integrations/ninja/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const j = await r.json();
      if (j?.ok) {
        setMsg('تم إسناد الطلب إلى Ninja ✅');
        await load();
      } else {
        setMsg(j?.error || 'تعذر إسناد الطلب');
      }
    } catch (e) {
      console.error(e);
      setMsg('تعذر إسناد الطلب');
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', direction: 'rtl' }}>
      <div style={{ padding: '16px 20px', background: '#0B1221', color: '#fff', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* زر واحد فقط: تحديث القائمة */}
          <button
            onClick={load}
            disabled={loading}
            style={{
              background: '#2E344D',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 14px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'جارِ التحديث…' : 'تحديث القائمة'}
          </button>

          <h1 style={{ margin: 0, marginInlineStart: 'auto', fontSize: 22 }}>
            <span style={{ color: '#5b8cff', fontWeight: 800 }}>Ninja</span> 
          </h1>
        </div>
      </div>

      {msg && (
        <div
          style={{
            margin: '16px 20px',
            background: '#FFF6D6',
            border: '1px solid #E8D29C',
            color: '#3A2E11',
            padding: 12,
            borderRadius: 10,
          }}
          onAnimationEnd={() => setTimeout(() => setMsg(null), 2200)}
        >
          {msg}
        </div>
      )}

      <div style={{ margin: '0 20px 24px', background: '#121826', borderRadius: 14, padding: 12, color: '#E6E9F3' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0B1221' }}>
            <tr>
              <th style={th}>رقم</th>
              <th style={th}>رقم الطلب</th>
              <th style={th}>الحالة</th>
              <th style={th}>المبلغ</th>
              <th style={th}>التاريخ</th>
              <th style={th}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const assigned = o.status === 'ASSIGNED';
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid #232B42' }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>{o.orderNumber}</td>
                  <td style={td}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: assigned ? '#153D2B' : '#3A2C14',
                        color: assigned ? '#4EE19E' : '#FFD166',
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td style={td}>SAR {Number(o.finalAmount || 0).toFixed(2)}</td>
                  <td style={td}>{new Date(o.createdAt).toLocaleString('ar-SA')}</td>
                  <td style={td}>
                    <button
                      onClick={() => assignToNinja(o.id)}
                      disabled={assigned || loading}
                      style={{
                        background: assigned ? '#2E344D' : '#2D4BC8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 12px',
                        cursor: assigned ? 'not-allowed' : 'pointer',
                        opacity: assigned ? 0.6 : 1,
                      }}
                      title={assigned ? 'تم الإسناد مسبقًا' : 'إسناد الطلب إلى Ninja'}
                    >
                      إسناد إلى Ninja
                    </button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td style={{ ...td, textAlign: 'center' }} colSpan={6}>
                  لا توجد طلبات حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#9AA4BF', marginInlineStart: 20, marginBottom: 28, fontSize: 13 }}>
        ملاحظة: الزر الظاهر بجانب كل طلب يقوم بنداء API <code>/api/integrations/ninja/create-order</code> ثم يحدّث
        الحالة مباشرة إلى <b>ASSIGNED</b> إذا نجحت العملية.
      </p>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'right',
  padding: '12px 10px',
  fontWeight: 700,
  color: '#AAB3CF',
  borderBottom: '1px solid #232B42',
};

const td: React.CSSProperties = {
  padding: '12px 10px',
};