'use client';
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

type PaymentFormProps = {
  onSubmit: (data: any) => void;
};

export default function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cardNumber, expiry, cvc });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-2">بيانات الدفع</h2>
      <Input
        label="رقم البطاقة"
        type="text"
        value={cardNumber}
        onChange={e => setCardNumber(e.target.value)}
        placeholder="•••• •••• •••• ••••"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="تاريخ الانتهاء"
          type="text"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
          placeholder="MM/YY"
          required
        />
        <Input
          label="CVC"
          type="text"
          value={cvc}
          onChange={e => setCvc(e.target.value)}
          placeholder="•••"
          required
        />
      </div>

      <Button type="submit" variant="primary" className="w-full">
        تأكيد الدفع
      </Button>
    </form>
  );
}
