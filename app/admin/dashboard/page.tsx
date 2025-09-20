'use client';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم (إدارة)</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card p-6">
          <h3 className="text-sm text-gray-600 mb-2">إجمالي الطلبات</h3>
          <div className="text-3xl font-bold text-blue-600">1,284</div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm text-gray-600 mb-2">طلبات اليوم</h3>
          <div className="text-3xl font-bold text-indigo-600">37</div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm text-gray-600 mb-2">المزوّدون النشِطون</h3>
          <div className="text-3xl font-bold text-green-600">112</div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm text-gray-600 mb-2">متوسط التقييم</h3>
          <div className="text-3xl font-bold text-yellow-500">4.8 ⭐</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">أكثر الخدمات طلبًا</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>غسيل سيارات</span><span className="font-medium">520 طلب</span>
            </li>
            <li className="flex justify-between">
              <span>مغسلة ملابس</span><span className="font-medium">340 طلب</span>
            </li>
            <li className="flex justify-between">
              <span>صيانة جوالات</span><span className="font-medium">215 طلب</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">أحدث الطلبات</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>#ORD-12931</span><span className="text-gray-600">قيد المعالجة</span>
            </li>
            <li className="flex justify-between">
              <span>#ORD-12930</span><span className="text-green-600">مكتمل</span>
            </li>
            <li className="flex justify-between">
              <span>#ORD-12929</span><span className="text-yellow-600">بانتظار المزود</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
