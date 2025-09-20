'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';


export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password: pass,
    });

    setLoading(false);

    if (res?.error) {
      alert('❌ خطأ في تسجيل الدخول. تأكد من البيانات.');
    } else {
      // نجاح — وجّه المستخدم (مثلاً للصفحة الرئيسية أو لوحة المزود)
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-[calc(100dvh-0px)] flex items-center justify-center p-4">
      {/* خلفية فخمة (grid + radial + noise) */}
      <div className="fixed inset-0 -z-30 bg-grid" />
      <div className="fixed inset-0 -z-20 bg-gradient-radial" />
      <div className="fixed inset-0 -z-10 bg-noise opacity-40 mix-blend-soft-light" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* اللوحة التعريفية */}
        <section className="glass hidden lg:flex flex-col justify-between p-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">الخدمات الذكية</h1>
                <p className="text-white/70 text-sm">Smart Services Platform</p>
              </div>
            </div>

            <h2 className="title-xl text-gradient mb-3">مرحبًا بعودتك 👋</h2>
            <p className="text-white/80 leading-relaxed">
              سجّل دخولك لإدارة الطلبات، تتبع التنفيذ، والدفع الآمن — كل ذلك من لوحة واحدة أنيقة وسريعة.
            </p>
          </div>

          <ul className="grid gap-3 text-white/85 mt-8">
            <li className="flex items-center gap-2">
              <span className="badge badge-neutral">آمن</span>
              تشفير كامل للبيانات وتحقق ثنائي عند الحاجة
            </li>
            <li className="flex items-center gap-2">
              <span className="badge badge-neutral">سريع</span>
              أداء عالي وتجربة استخدام سلسة
            </li>
            <li className="flex items-center gap-2">
              <span className="badge badge-neutral">دعم</span>
              خدمة عملاء على مدار الساعة
            </li>
          </ul>

          <p className="text-white/60 text-xs">© {new Date().getFullYear()} Smart Services. جميع الحقوق محفوظة.</p>
        </section>

        {/* فورم تسجيل الدخول */}
        <section className="glass p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white">تسجيل الدخول</h3>
            <p className="text-white/70 mt-1 text-sm">
              ليس لديك حساب؟ <a href="/register" className="text-blue-300 hover:text-white">إنشاء حساب</a>
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* البريد */}
            <div>
              <label className="block mb-2 text-white/85 font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  className="input-field pr-11"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block mb-2 text-white/85 font-medium">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                  aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <label className="flex items-center gap-2 text-white/80">
                  <input type="checkbox" className="scale-110 accent-blue-500" /> تذكرني
                </label>
                <a href="/forgot" className="text-blue-300 hover:text-white">نسيت كلمة المرور؟</a>
              </div>
            </div>

            {/* زر الدخول */}
            <button type="submit" className="btn-gradient w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* فاصل اجتماعي */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-white/70 text-xs">أو</span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* أزرار الدخول الاجتماعي */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => signIn('google')}
                className="w-full input-field !bg-white !text-gray-900 !border-gray-200 hover:brightness-95"
              >
                الدخول بـ Google
              </button>
              <button
                type="button"
                onClick={() => signIn('github')}
                className="w-full input-field !bg-white !text-gray-900 !border-gray-200 hover:brightness-95"
              >
                الدخول بـ GitHub
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
