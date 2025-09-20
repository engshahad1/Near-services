'use client';
import React from 'react';
import clsx from 'clsx';

const navLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/services', label: 'الخدمات' },
  { href: '/providers', label: 'مقدمو الخدمة' },
  { href: '/contact', label: 'اتصل بنا' },
];

export default function Navigation() {
  return (
    <nav className="hidden md:flex gap-6">
      {navLinks.map(link => (
        <a
          key={link.href}
          href={link.href}
          className={clsx(
            'nav-link',
            window?.location?.pathname === link.href && 'nav-link-active'
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
