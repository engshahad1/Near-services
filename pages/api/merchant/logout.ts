// pages/api/merchant/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', 'merchantId=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  res.status(200).json({ ok: true });
}