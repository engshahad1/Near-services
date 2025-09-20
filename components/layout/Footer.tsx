'use client';
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container py-8 grid md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">عن المنصة</h3>
          <p className="text-sm text-gray-600">
            سوق الخدمات يربطك مع أفضل مقدمي الخدمات في السعودية بسرعة وأمان.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">روابط سريعة</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="/about" className="hover:text-blue-600">من نحن</a></li>
            <li><a href="/services" className="hover:text-blue-600">الخدمات</a></li>
            <li><a href="/contact" className="hover:text-blue-600">اتصل بنا</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">تواصل معنا</h3>
          <p className="text-sm text-gray-600">البريد: support@example.com</p>
          <p className="text-sm text-gray-600">الهاتف: +966 500 000 000</p>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
