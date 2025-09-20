'use client';
import React from 'react';
import { CheckCircle, Clock, Truck } from 'lucide-react';

type Step = {
  label: string;
  status: 'pending' | 'active' | 'done';
};

type OrderTrackerProps = {
  steps: Step[];
};

export default function OrderTracker({ steps }: OrderTrackerProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-4">تتبع الطلب</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {step.status === 'done' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {step.status === 'active' && (
              <Truck className="h-5 w-5 text-blue-600 animate-pulse" />
            )}
            {step.status === 'pending' && (
              <Clock className="h-5 w-5 text-gray-400" />
            )}
            <span
              className={`text-sm ${
                step.status === 'active'
                  ? 'font-medium text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
