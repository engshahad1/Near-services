import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

type ApiResponse = { received: true } | { ok: false; error: string };

const DELIVERY_SECRET = process.env.DELIVERY_CALLBACK_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // تحقق من التوقيع/السر
    const token = req.headers['x-delivery-token'];
    if (!token || token !== DELIVERY_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const body = req.body;
    const { provider, orderId, status, trackingUrl, driverName } = body;

    if (!orderId) return res.status(400).json({ ok: false, error: 'orderId مطلوب.' });

    // حدث الطلب
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status ?? 'IN_PROGRESS',
        deliveryProvider: provider ?? null,
        deliveryTrackingUrl: trackingUrl ?? null,
        deliveryDriverName: driverName ?? null,
      },
    });

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('delivery webhook error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
