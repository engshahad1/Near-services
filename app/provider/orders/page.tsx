'use client';
import React from 'react';

const orders = [
  { id: '1001', service: 'غسيل سيارات', customer: 'سارة أحمد', status: 'قيد التنفيذ' },
  { id: '1002', service: 'صيانة جوال', customer: 'فهد محمد', status: 'مكتمل' },
  { id: '1003', service: 'غسيل ملابس', customer: 'محمد صالح', status: 'ملغي' },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">الطلبات</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-right">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-3">رقم الطلب</th>
              <th className="px-6 py-3">الخدمة</th>
              <th className="px-6 py-3">العميل</th>
              <th className="px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4 font-medium">{order.id}</td>
                <td className="px-6 py-4">{order.service}</td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium
                      ${order.status === 'مكتمل' ? 'bg-green-100 text-green-800' :
                        order.status === 'قيد التنفيذ' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}
                    `}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
