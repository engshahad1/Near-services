'use client';
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

type AddressFormProps = {
  onSubmit: (data: any) => void;
};

export default function AddressForm({ onSubmit }: AddressFormProps) {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ street, city, postalCode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-2">العنوان</h2>
      <Input
        label="الشارع"
        value={street}
        onChange={e => setStreet(e.target.value)}
        required
      />
      <Input
        label="المدينة"
        value={city}
        onChange={e => setCity(e.target.value)}
        required
      />
      <Input
        label="الرمز البريدي"
        value={postalCode}
        onChange={e => setPostalCode(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" className="w-full">
        حفظ العنوان
      </Button>
    </form>
  );
}
