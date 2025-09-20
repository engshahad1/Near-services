'use client';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-2">عدد الطلبات</h2>
          <p className="text-3xl font-bold text-blue-600">25</p>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-2">التقييم</h2>
          <p className="text-3xl font-bold text-yellow-500">4.8 ⭐</p>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-2">الأرباح</h2>
          <p className="text-3xl font-bold text-green-600">1200 ر.س</p>
        </div>
      </div>
    </div>
  );
}
