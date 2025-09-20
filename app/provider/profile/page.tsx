'use client';
import React, { useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState('أحمد محمد');
  const [phone, setPhone] = useState('0501234567');
  const [bio, setBio] = useState('مقدم خدمة متخصص في الصيانة.');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم حفظ التغييرات بنجاح ✅');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">الملف الشخصي</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 max-w-lg">
        <div className="form-group">
          <label className="form-label">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label className="form-label">رقم الجوال</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label className="form-label">نبذة تعريفية</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="textarea-field"
          />
        </div>

        <button type="submit" className="btn btn-primary">حفظ التغييرات</button>
      </form>
    </div>
  );
}
