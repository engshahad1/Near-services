// pages/api/integrations/ninja/quote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { quote } from '../../../../lib/integrations/ninja';

type Resp = { ok: true; data: any } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  try {
    const { pickup, dropoff, weightKg } = req.body ?? {};
    if (!pickup?.lat || !pickup?.lng || !dropoff?.lat || !dropoff?.lng) {
      return res.status(400).json({ ok: false, error: 'pickup/dropoff lat,lng مطلوبة' });
    }
    const data = quote({ pickup, dropoff, weightKg: Number(weightKg) || 1 });
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error('ninja/quote error', e);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
