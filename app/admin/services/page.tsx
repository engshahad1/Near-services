'use client';
import { useState } from 'react';

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  category: 'laundry' | 'locks' | 'carwash' | 'mobilefix' | 'emergency' | 'other';
  basePrice: number;
  active: boolean;
};

const initialServices: ServiceRow[] = [
  { id: 'SVC-01', name: 'مغسلة ملابس - استلام وتسليم', slug: 'laundry', category: 'laundry', basePrice: 20, active: true },
  { id: 'SVC-02', name: 'غسيل سيارات عند الموقع', slug: 'carwash', category: 'carwash', basePrice: 80, active: true },
  { id: 'SVC-03', name: 'أقفال وطوارئ مفاتيح', slug: 'locks', category: 'locks', basePrice: 120, active: false },
];

export default function AdminServicesPage() {
  const [rows, setRows] = useState<ServiceRow[]>(initialServices);

  const toggleActive = (id: string) =>
    setRows(prev => prev.map(s => (s.id === id ? { ...s, active: !s.active } : s)));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الخدمات</h1>
        <button className="btn btn-primary">إضافة خدمة</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-3">المعرف</th>
              <th className="px-6 py-3">الاسم</th>
              <th className="px-6 py-3">المعرف النصي (slug)</th>
              <th className="px-6 py-3">الفئة</th>
              <th className="px-6 py-3">السعر الأساسي</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium">{s.id}</td>
                <td className="px-6 py-4">{s.name}</td>
                <td className="px-6 py-4">{s.slug}</td>
                <td className="px-6 py-4">
                  <span className="badge badge-secondary">{s.category}</span>
                </td>
                <td className="px-6 py-4">{s.basePrice} ر.س</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${s.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                    {s.active ? 'مفعّل' : 'موقوف'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(s.id)} className="btn btn-outline btn-sm">
                      {s.active ? 'إيقاف' : 'تفعيل'}
                    </button>
                    <button className="btn btn-secondary btn-sm">تعديل</button>
                    <button className="btn btn-danger btn-sm">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
