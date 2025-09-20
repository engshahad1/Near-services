'use client';
import { useState } from 'react';

type OrderRow = {
  id: string;
  customer: string;
  service: string;
  price: number;
  status: 'new' | 'processing' | 'assigned' | 'done' | 'cancelled';
  createdAt: string;
};

const initialOrders: OrderRow[] = [
  { id: 'ORD-12931', customer: 'سارة أحمد', service: 'غسيل سيارات', price: 120, status: 'processing', createdAt: '2025-08-28 10:14' },
  { id: 'ORD-12930', customer: 'فهد محمد', service: 'مغسلة ملابس', price: 65, status: 'done', createdAt: '2025-08-28 09:42' },
  { id: 'ORD-12929', customer: 'نورة علي', service: 'صيانة جوال', price: 180, status: 'assigned', createdAt: '2025-08-28 09:05' },
  { id: 'ORD-12928', customer: 'محمد صالح', service: 'سباكة طوارئ', price: 220, status: 'new', createdAt: '2025-08-28 08:51' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);

  const badge = (s: OrderRow['status']) =>
    s === 'done' ? 'bg-green-100 text-green-800' :
    s === 'processing' ? 'bg-blue-100 text-blue-800' :
    s === 'assigned' ? 'bg-indigo-100 text-indigo-800' :
    s === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

  const updateStatus = (id: string, status: OrderRow['status']) =>
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">إدارة الطلبات</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-3">رقم الطلب</th>
              <th className="px-6 py-3">العميل</th>
              <th className="px-6 py-3">الخدمة</th>
              <th className="px-6 py-3">السعر</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">التاريخ</th>
              <th className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-4 font-medium">{o.id}</td>
                <td className="px-6 py-4">{o.customer}</td>
                <td className="px-6 py-4">{o.service}</td>
                <td className="px-6 py-4">{o.price} ر.س</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${badge(o.status)}`}>
                    {o.status === 'new' && 'جديد'}
                    {o.status === 'processing' && 'قيد المعالجة'}
                    {o.status === 'assigned' && 'مُسند'}
                    {o.status === 'done' && 'مكتمل'}
                    {o.status === 'cancelled' && 'ملغي'}
                  </span>
                </td>
                <td className="px-6 py-4">{o.createdAt}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(o.id, 'assigned')} className="btn btn-outline btn-sm">إسناد</button>
                    <button onClick={() => updateStatus(o.id, 'processing')} className="btn btn-secondary btn-sm">معالجة</button>
                    <button onClick={() => updateStatus(o.id, 'done')} className="btn btn-success btn-sm">إنهاء</button>
                    <button onClick={() => updateStatus(o.id, 'cancelled')} className="btn btn-danger btn-sm">إلغاء</button>
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
