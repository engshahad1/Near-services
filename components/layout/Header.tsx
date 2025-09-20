'use client';
import React from 'react';
import Navigation from './Navigation';
import Button from '../ui/Button';

export default function Header() {
  return (
    <header className="header-sticky">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-gradient">
          سوق الخدمات
        </a>

        {/* Navigation */}
        <Navigation />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">تسجيل الدخول</Button>
          <Button variant="primary" size="sm">إنشاء حساب</Button>
        </div>
      </div>
    </header>
  );
}
