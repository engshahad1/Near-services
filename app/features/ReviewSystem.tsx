'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

const ReviewSystem = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newReview: Review = {
      id: Date.now().toString(),
      name,
      rating,
      comment,
    };

    setReviews((prev) => [...prev, newReview]);
    setName('');
    setComment('');
    setRating(5);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4">أضف تقييمك</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="اسمك"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <textarea
          className="input-field"
          placeholder="اكتب تعليقك..."
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
        />
        <select
          className="input-field"
          value={rating}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} نجوم
            </option>
          ))}
        </select>
        <Button type="submit">إرسال</Button>
      </form>

      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border-b pb-2">
            <p className="font-semibold">{r.name}</p>
            <p className="text-yellow-500">⭐ {r.rating}</p>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSystem;
