// lib/payment/index.ts
export type PaymentMethod = "mada" | "apple_pay" | "stc_pay";

export interface PaymentRequest {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  method?: PaymentMethod;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;    // ل Stripe
  redirectUrl?: string;     // ✅ جديد لعمليات الـ Redirect (STC Pay, ..)
  error?: string;
}

export { processStripePayment } from "./stripe";
export { processSTCPayPayment } from "./stc-pay";
