'use client';
import React from 'react';
import clsx from 'clsx';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
};

export default function Card({ children, className, hoverable = true }: CardProps) {
  return (
    <div 
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
        hoverable && 'transition-all hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}
