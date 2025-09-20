'use client';
import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <Link href="/admin/dashboard" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">لوحة التحكم</h2>
          <p className="text-sm text-gray-600">ملخّص الأرقام والإحصائيات.</p>
        </Link>

        <Link href="/admin/orders" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">الطلبات</h2>
          <p className="text-sm text-gray-600">إدارة وتتبع طلبات العملاء.</p>
        </Link>

        <Link href="/admin/providers" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">المزوّدون</h2>
          <p className="text-sm text-gray-600">إدارة مقدمي الخدمة واعتمادهم.</p>
        </Link>

        <Link href="/admin/services" className="card p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg mb-2">الخدمات</h2>
          <p className="text-sm text-gray-600">إضافة/تعديل خدمات المنصّة.</p>
        </Link>
      </div>
    </div>
  );
}
