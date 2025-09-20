'use client';
import Link from 'next/link';

export default function ProviderPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">لوحة مقدم الخدمة</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/provider/dashboard" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">لوحة التحكم</h2>
          <p className="text-sm text-gray-600">
            إدارة أعمالك، مراجعة الإحصائيات والتقارير.
          </p>
        </Link>

        <Link href="/provider/orders" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">الطلبات</h2>
          <p className="text-sm text-gray-600">
            عرض وإدارة طلبات العملاء المستلمة.
          </p>
        </Link>

        <Link href="/provider/profile" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">الملف الشخصي</h2>
          <p className="text-sm text-gray-600">
            تحديث بياناتك ومعلومات الاتصال الخاصة بك.
          </p>
        </Link>
      </div>
    </div>
  );
}
