import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import Stripe from 'stripe';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

// لا نحدد apiVersion هنا لتفادي أخطاء literal types
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const {
      amount,          // major units (e.g. 49.99)
      currency = 'sar',
      orderId,
      customerEmail,
      description,
      metadata = {},
    } = req.body ?? {};

    if (amount == null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ ok: false, error: 'amount غير صالح.' });
    }
    if (orderId && typeof orderId !== 'string') {
      return res.status(400).json({ ok: false, error: 'orderId غير صالح.' });
    }

    const amountInMinor = Math.round(Number(amount) * 100);

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return res.status(404).json({ ok: false, error: 'الطلب غير موجود.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInMinor,
      currency,
      description: description ?? (orderId ? `Order ${orderId}` : 'Order'),
      metadata: { ...metadata, orderId: orderId ?? '' },
      receipt_email: customerEmail,
      automatic_payment_methods: { enabled: true },
    });

    if (orderId) {
      // غيّرها حسب enum حالاتك لو عندك
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PENDING' },
      }).catch(() => {});
    }

    return res.status(201).json({
      ok: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      },
    });
  } catch (err: any) {
    console.error('payments/create error:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
}
