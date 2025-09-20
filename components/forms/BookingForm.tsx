'use client';
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

type BookingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

export default function BookingForm({ isOpen, onClose, onSubmit }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, date });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <h2 className="text-xl font-bold mb-4">نموذج الحجز</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="الاسم الكامل"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Input
          label="رقم الجوال"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <Input
          label="تاريخ الحجز"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary">
            تأكيد الحجز
          </Button>
        </div>
      </form>
    </Modal>
  );
}
