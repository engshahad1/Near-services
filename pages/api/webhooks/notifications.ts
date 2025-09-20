import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

type ApiResponse = { received: true } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { type, messageId, status, recipient } = req.body;

    // خزن في جدول notifications لو عندك
    await prisma.notification.create({
      data: {
        provider: type ?? 'unknown',
        messageId: messageId ?? '',
        status: status ?? 'delivered',
        recipient: recipient ?? '',
      },
    }).catch(() => {});

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('notifications webhook error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
