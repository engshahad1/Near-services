'use client';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/services', label: 'الخدمات' },
  { href: '/providers', label: 'مقدمو الخدمة' },
  { href: '/contact', label: 'اتصل بنا' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar content */}
          <div className="relative bg-white w-64 h-full shadow-lg p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>

            <nav className="mt-10 flex flex-col gap-4">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
