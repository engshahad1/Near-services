'use client';
import React from 'react';
import { Star, Clock, Users } from 'lucide-react';

type ServiceCardProps = {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  providers: number;
  image: string;
  onClick?: () => void;
};

export default function ServiceCard({
  title,
  description,
  price,
  rating,
  reviews,
  providers,
  image,
  onClick
}: ServiceCardProps) {
  return (
    <div
      onClick={onClick}
      className="service-card group cursor-pointer overflow-hidden"
    >
      {/* صورة الخدمة */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* معلومات الخدمة */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            {rating} ({reviews})
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {providers}
          </div>
        </div>

        <div className="mt-2 font-bold text-blue-600">{price}</div>
      </div>
    </div>
  );
}
