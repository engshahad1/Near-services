import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import prisma from '../../../lib/prisma';

export const config = { api: { bodyParser: false } };

type ApiResponse = { received: true } | { ok: false; error: string };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// raw body reader
async function readBuffer(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  let event: Stripe.Event;
  try {
    const buf = await readBuffer(req);
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: `Webhook Error: ${err?.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = (pi.metadata?.orderId as string) || undefined;
        if (orderId) {
          await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = (pi.metadata?.orderId as string) || undefined;
        if (orderId) {
          await prisma.order.update({ where: { id: orderId }, data: { status: 'PENDING' } });
        }
        break;
      }
      case 'charge.refunded': {
        const ch = event.data.object as Stripe.Charge;
        const orderId = (ch.metadata?.orderId as string) || undefined;
        if (orderId) {
          await prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
        }
        break;
      }
    }
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('stripe webhook error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
