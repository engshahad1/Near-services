'use client';
import React from 'react';
import clsx from 'clsx';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export default function Modal({ isOpen, onClose, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={clsx('bg-white rounded-2xl shadow-xl w-full', sizes[size])}>
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
