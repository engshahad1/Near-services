import { useState } from 'react';
import { useRouter } from 'next/router';

export default function MerchantLogin() {
  const r = useRouter();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, businessName }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'failed');
      const { provider } = json.data;
      // نخزن هوية المزود محليًا للديمو
      localStorage.setItem('demoProviderId', provider.id);
      localStorage.setItem('demoProviderName', provider.businessName);
      r.replace('/demo/merchant');
    } catch (e: any) {
      setErr(e.message || 'خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0b1b2b'}}>
      <form onSubmit={submit} style={{background:'#11263b',padding:24,borderRadius:12,width:420,maxWidth:'90%'}}>
        <h1 style={{color:'#fff',marginBottom:16}}>تسجيل دخول المحل (Demo)</h1>
        {err && <div style={{background:'#7f1d1d',color:'#fff',padding:8,borderRadius:8,marginBottom:12}}>{err}</div>}
        <label style={{color:'#a7c0d8'}}>اسم المالك</label>
        <input value={name} onChange={e=>setName(e.target.value)} required
          style={{width:'100%',margin:'6px 0 12px',padding:10,borderRadius:8,border:'1px solid #274766',background:'#0f2236',color:'#fff'}}/>
        <label style={{color:'#a7c0d8'}}>اسم المحل</label>
        <input value={businessName} onChange={e=>setBusinessName(e.target.value)}
          placeholder="اختياري" 
          style={{width:'100%',margin:'6px 0 12px',padding:10,borderRadius:8,border:'1px solid #274766',background:'#0f2236',color:'#fff'}}/>
        <label style={{color:'#a7c0d8'}}>جوال</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} required
          placeholder="05xxxxxxxx" 
          style={{width:'100%',margin:'6px 0 16px',padding:10,borderRadius:8,border:'1px solid #274766',background:'#0f2236',color:'#fff'}}/>
        <button disabled={loading} style={{width:'100%',padding:12,borderRadius:10,border:'none',background:'#2563eb',color:'#fff',fontWeight:700}}>
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
    </div>
  );
}