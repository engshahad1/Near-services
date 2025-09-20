'use client';
import { useState } from 'react';

type ProviderRow = {
  id: string;
  name: string;
  phone: string;
  services: string[];
  rating: number;
  status: 'pending' | 'approved' | 'suspended';
};

const initialProviders: ProviderRow[] = [
  { id: 'PR-501', name: 'أحمد العتيبي', phone: '0501112233', services: ['غسيل سيارات'], rating: 4.9, status: 'approved' },
  { id: 'PR-502', name: 'خالد الدوسري', phone: '0502223344', services: ['مغسلة ملابس', 'توصيل'], rating: 4.6, status: 'pending' },
  { id: 'PR-503', name: 'نواف المطيري', phone: '0503334455', services: ['صيانة جوالات'], rating: 4.7, status: 'suspended' },
];

export default function AdminProvidersPage() {
  const [rows, setRows] = useState<ProviderRow[]>(initialProviders);

  const badge = (s: ProviderRow['status']) =>
    s === 'approved' ? 'bg-green-100 text-green-800' :
    s === 'pending' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  const setStatus = (id: string, status: ProviderRow['status']) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">مقدمو الخدمة</h1>
        <button className="btn btn-primary">إضافة مزوّد</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-3">المعرف</th>
              <th className="px-6 py-3">الاسم</th>
              <th className="px-6 py-3">الجوال</th>
              <th className="px-6 py-3">الخدمات</th>
              <th className="px-6 py-3">التقييم</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-medium">{p.id}</td>
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4">{p.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {p.services.map((s, i) => (
                      <span key={i} className="badge badge-secondary">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">{p.rating} ⭐</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${badge(p.status)}`}>
                    {p.status === 'approved' && 'معتمد'}
                    {p.status === 'pending' && 'بانتظار المراجعة'}
                    {p.status === 'suspended' && 'موقوف'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(p.id, 'approved')} className="btn btn-success btn-sm">اعتماد</button>
                    <button onClick={() => setStatus(p.id, 'suspended')} className="btn btn-warning btn-sm">إيقاف</button>
                    <button className="btn btn-outline btn-sm">تعديل</button>
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
