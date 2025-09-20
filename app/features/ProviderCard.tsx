'use client';
import React from 'react';
import { Star, Verified, Clock } from 'lucide-react';

type ProviderCardProps = {
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  responseTime: string;
  photo: string;
  verified?: boolean;
  onClick?: () => void;
};

export default function ProviderCard({
  name,
  rating,
  reviews,
  experience,
  responseTime,
  photo,
  verified,
  onClick
}: ProviderCardProps) {
  return (
    <div
      onClick={onClick}
      className="card card-hover cursor-pointer flex items-center gap-4 p-4"
    >
      {/* صورة المقدم */}
      <img
        src={photo}
        alt={name}
        className="w-16 h-16 rounded-full object-cover"
      />

      {/* بيانات المقدم */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {verified && <Verified className="h-4 w-4 text-blue-600" />}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          {rating} ({reviews} تقييم)
        </div>
        <div className="text-xs text-gray-500 mt-1">
          خبرة {experience} سنوات • استجابة خلال {responseTime}
        </div>
      </div>
    </div>
  );
}
