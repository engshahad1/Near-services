import Stripe from "stripe";
import { PaymentRequest, PaymentResponse } from "./index";

const key = process.env.STRIPE_SECRET_KEY || "";
const envVersion = process.env.STRIPE_API_VERSION;

// مرّر apiVersion فقط إن وُجد لتفادي تعارض الأنواع
const stripe = new Stripe(key, {
  ...(envVersion
    ? { apiVersion: envVersion as unknown as Stripe.LatestApiVersion }
    : {}),
});

export async function processStripePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: request.amount * 100,             // Stripe بالـ cents
      currency: request.currency || "sar",
      description: request.description,
      metadata: request.metadata,
    });

    return {
      success: true,
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
