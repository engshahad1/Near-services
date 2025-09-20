// pages/demo/customer.tsx
import { useEffect, useMemo, useState } from 'react';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  durationMinutes?: number;
};
type Address = {
  id: string;
  title: string;
  address: string;
  city: string;
  district?: string | null;
  isDefault?: boolean;
};

const DEMO_USER_ID = 'u1'; // نفس المستخدم اللي شغّالين عليه بالداتا التجريبية

export default function CustomerDemo() {
  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    // بعد ساعة من الآن
    const dt = new Date(Date.now() + 60 * 60 * 1000);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [toast, setToast] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      // الخدمات
      const sRes = await fetch('/api/services?page=1&pageSize=50');
      const sJson = await sRes.json();
      const sItems: Service[] = sJson?.data?.items ?? [];
      setServices(sItems);
      setSelectedService(sItems[0] ?? null);

      // العناوين
      const aRes = await fetch(`/api/addresses?userId=${DEMO_USER_ID}&page=1&pageSize=50`);
      const aJson = await aRes.json();
      const aItems: Address[] = aJson?.data?.items ?? [];
      setAddresses(aItems);
      const def = aItems.find((a) => a.isDefault) ?? aItems[0];
      setSelectedAddressId(def?.id ?? '');
    } catch (e) {
      console.error(e);
      setToast('تعذّر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalAmount = useMemo(() => {
    // ممكن تضيف ضريبة أو توصيل لاحقًا، الآن نعرض سعر الخدمة فقط
    return selectedService?.price ?? 0;
  }, [selectedService]);

  async function createOrder() {
    if (!selectedService || !selectedAddressId || !scheduledAt) {
      setToast('رجاءً اختر الخدمة والعنوان وحدد الوقت');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          serviceId: selectedService.id,
          addressId: selectedAddressId,
          paymentMethod,
          scheduledAt: new Date(scheduledAt).toISOString(),
          totalAmount,
        }),
      });
      const j = await res.json();
      if (j?.ok) {
        setOrderNumber(j.data?.orderNumber ?? null);
        setToast('تم إنشاء الطلب بنجاح ✨');
      } else {
        setToast(j?.error || 'تعذر إنشاء الطلب');
      }
    } catch (e) {
      console.error(e);
      setToast('تعذر إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={page}>
      {/* الهيدر */}
      <header style={header}>
        <div style={brand}>
          <span style={dot} />
          <b>Smart Services</b>
        </div>
        <div style={{ opacity: 0.9 }}>  ()</div>
      </header>

      {/* هيرو */}
      <section style={hero}>
        <div>
          
          <p style={lead}>
            اختر الخدمة، حدّد العنوان والوقت، وأكد الطلب.
            <br /> 
          </p>
        </div>
        <div style={heroBadge}>
          <span> سريع</span>
          <span>آمن</span>
          <span>متكامل</span>
        </div>
      </section>

      {/* المحتوى الرئيسي */}
      <main style={grid}>
        {/* الخدمات */}
        <section style={card}>
          <div style={cardHead}>
            <h3 style={cardTitle}>اختر الخدمة</h3>
            <small style={muted}>{services.length} خدمة متاحة</small>
          </div>

          <div style={serviceGrid}>
            {loading && <div style={muted}>جارِ التحميل…</div>}
            {!loading &&
              services.map((s) => {
                const active = selectedService?.id === s.id;
                return (
                  <button
                    key={s.id}
                    style={{
                      ...serviceItem,
                      ...(active ? serviceItemActive : {}),
                      backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
                    }}
                    onClick={() => setSelectedService(s)}
                    title={s.description}
                  >
                    <div style={serviceOverlay} />
                    <div style={{ position: 'relative' }}>
                      <div style={chip}>SAR {s.price}</div>
                      <div style={serviceName}>{s.name}</div>
                      {s.rating && (
                        <div style={rating}>
                          ⭐ {s.rating?.toFixed(1)} <span style={mutedSmall}>({s.reviewCount || 0})</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </section>

        {/* التفاصيل والتأكيد */}
        <section style={sideCard}>
          <h3 style={{ ...cardTitle, marginBottom: 16 }}>تفاصيل الطلب</h3>

          {/* العنوان */}
          <label style={label}>العنوان</label>
          <select
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
            style={select}
          >
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} — {a.address} {a.city ? `(${a.city})` : ''}
              </option>
            ))}
          </select>

          {/* الوقت */}
          <label style={label}>وقت التنفيذ</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={input}
          />

          {/* الدفع */}
          <label style={label}>طريقة الدفع</label>
          <div style={payRow}>
            <button
              onClick={() => setPaymentMethod('cash')}
              style={{ ...payBtn, ...(paymentMethod === 'cash' ? payBtnActive : {}) }}
            >
              💵 نقدًا
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              style={{ ...payBtn, ...(paymentMethod === 'card' ? payBtnActive : {}) }}
            >
              💳 بطاقة
            </button>
          </div>

          {/* ملخص */}
          <div style={summary}>
            <div style={summaryRow}>
              <span>الخدمة</span>
              <b>{selectedService?.name || '-'}</b>
            </div>
            <div style={summaryRow}>
              <span>السعر</span>
              <b>SAR {totalAmount.toFixed(2)}</b>
            </div>
            <div style={summaryRow}>
              <span>المدة التقريبية</span>
              <b>{selectedService?.durationMinutes ?? 60} دقيقة</b>
            </div>
          </div>

          <button
            onClick={createOrder}
            disabled={submitting || !selectedService || !selectedAddressId}
            style={cta}
          >
            {submitting ? 'جاري إنشاء الطلب…' : 'تأكيد الطلب'}
          </button>

          {orderNumber && (
            <div style={successBox}>
               تم إنشاء الطلب رقم <b>{orderNumber}</b> 
            </div>
          )}

          <p style={{ ...muted, marginTop: 14 }}>
            <code></code>
          </p>
        </section>
      </main>

      {/* توست */}
      {toast && (
        <div style={toastBox} onAnimationEnd={() => setTimeout(() => setToast(null), 2200)}>
          {toast}
        </div>
      )}

      <footer style={footer}>
      </footer>
    </div>
  );
}

/* ================== Styles (inline CSS) ================== */
const page: React.CSSProperties = { direction: 'rtl', color: '#0B1221', background: 'linear-gradient(180deg,#f6f9ff,#ffffff)' };
const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #EEF2FF', zIndex: 2 };
const brand: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 };
const dot: React.CSSProperties = { width: 10, height: 10, borderRadius: 10, background: 'conic-gradient(#6aa7ff, #4ee19e, #ffd166,#6aa7ff)' };
const hero: React.CSSProperties = { padding: '28px', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' };
const h1: React.CSSProperties = { fontSize: 34, margin: 0, color: '#0B1221' };
const lead: React.CSSProperties = { marginTop: 8, color: '#475569', lineHeight: 1.8 };
const heroBadge: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', background: '#0B1221', color: '#fff', padding: '8px 12px', borderRadius: 999 };

const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20, padding: '8px 28px 32px' };
const card: React.CSSProperties = { background: '#ffffff', border: '1px solid #E6ECFF', borderRadius: 16, padding: 18, boxShadow: '0 10px 30px rgba(16,24,40,0.06)' };
const cardHead: React.CSSProperties = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 };
const cardTitle: React.CSSProperties = { margin: 0, fontSize: 18, color: '#0B1221' };
const muted: React.CSSProperties = { color: '#7C8AA5' };
const mutedSmall: React.CSSProperties = { color: '#C8D1E5', fontSize: 12 };

const serviceGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14, marginTop: 8 };
const serviceItem: React.CSSProperties = {
  position: 'relative',
  height: 130,
  borderRadius: 14,
  border: '1px solid #E6ECFF',
  background: '#F7FAFF',
  overflow: 'hidden',
  textAlign: 'right',
  padding: 12,
  cursor: 'pointer',
};
const serviceItemActive: React.CSSProperties = { outline: '2px solid #5b8cff', boxShadow: '0 8px 24px rgba(91,140,255,0.25)' };
const serviceOverlay: React.CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,20,40,0) 20%,rgba(10,20,40,0.1))' };
const chip: React.CSSProperties = { display: 'inline-block', padding: '4px 8px', background: 'rgba(255,255,255,0.85)', borderRadius: 999, border: '1px solid #E6ECFF', fontWeight: 700, marginBottom: 6 };
const serviceName: React.CSSProperties = { color: '#0B1221', fontWeight: 800, fontSize: 16 };
const rating: React.CSSProperties = { marginTop: 6, color: '#0B1221', fontWeight: 600 };

const sideCard: React.CSSProperties = { ...card, position: 'sticky', top: 88, height: 'fit-content' };
const label: React.CSSProperties = { display: 'block', margin: '10px 0 6px', color: '#475569', fontWeight: 700 };
const select: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E3E8F5', background: '#FBFDFF' };
const input: React.CSSProperties = { ...select };
const payRow: React.CSSProperties = { display: 'flex', gap: 8 };
const payBtn: React.CSSProperties = { flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #E6ECFF', background: '#F7FAFF', cursor: 'pointer', fontWeight: 700 };
const payBtnActive: React.CSSProperties = { background: '#0B1221', color: '#fff', borderColor: '#0B1221' };

const summary: React.CSSProperties = { marginTop: 14, border: '1px dashed #D7DFF2', borderRadius: 12, padding: 12, background: '#FAFCFF' };
const summaryRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#0B1221' };

const cta: React.CSSProperties = {
  width: '100%',
  marginTop: 16,
  padding: '12px 14px',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(90deg,#5b8cff,#4EE19E)',
  color: '#0B1221',
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(91,140,255,0.35)',
};

const successBox: React.CSSProperties = { marginTop: 12, padding: 10, borderRadius: 10, background: '#EBFFF6', border: '1px solid #BDF5DF', color: '#124C37' };

const toastBox: React.CSSProperties = {
  position: 'fixed',
  bottom: 20,
  left: 20,
  background: '#0B1221',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
};

const footer: React.CSSProperties = { textAlign: 'center', padding: '18px', color: '#7C8AA5' };
const link: React.CSSProperties = { color: '#2D4BC8', textDecoration: 'none', fontWeight: 700 };