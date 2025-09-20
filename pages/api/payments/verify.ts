import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import Stripe from 'stripe';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const { paymentIntentId } = req.query as { paymentIntentId?: string };
    if (!paymentIntentId) {
      return res.status(400).json({ ok: false, error: 'paymentIntentId مطلوب.' });
    }

    // لا نستخدم expand('charges') لتجنب خطأ الأنواع
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    const orderId = (pi.metadata?.orderId as string) || undefined;
    if (orderId && pi.status === 'succeeded') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }, // عدّليها حسب enum حالاتك
      }).catch(() => {});
    }

    // 👇 نجلب الـ charges عبر الـ Charges API بدلاً من pi.charges
    const chargeList = await stripe.charges.list({ payment_intent: paymentIntentId, limit: 10 });
    const charges = chargeList.data.map((c: Stripe.Charge) => ({
      id: c.id,
      paid: c.paid,
      status: c.status,
      amount: c.amount,
      currency: c.currency,
      receipt_url: c.receipt_url ?? null,
      created: c.created,
    }));

    return res.status(200).json({
      ok: true,
      data: {
        id: pi.id,
        status: pi.status,
        amount: pi.amount,
        currency: pi.currency,
        orderId: orderId ?? null,
        latestChargeId: (pi.latest_charge as string) ?? null,
        charges,
      },
    });
  } catch (err: any) {
    console.error('payments/verify error:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
}
