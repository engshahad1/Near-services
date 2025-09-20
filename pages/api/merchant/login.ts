// بسيط: يدخل برقم الجوال واسم المحل، ننشئ/نحدّث User + Provider ونرجّع providerId
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { ProviderStatus, UserRole } from '@prisma/client';

type Resp = { ok: true; providerId: string; providerName: string } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const { phone, providerName } = req.body ?? {};
    if (!phone || !providerName) return res.status(400).json({ ok: false, error: 'phone & providerName required' });

    // user by phone
    const user = await prisma.user.upsert({
      where: { phone },
      update: { name: providerName, role: UserRole.PROVIDER },
      create: { phone, name: providerName, role: UserRole.PROVIDER },
      select: { id: true },
    });

    // provider by userId
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: { name: providerName, isActive: true, status: ProviderStatus.APPROVED },
      create: {
        userId: user.id,
        name: providerName,
        isActive: true,
        status: ProviderStatus.APPROVED,
      },
      select: { id: true, name: true },
    });

    return res.status(200).json({ ok: true, providerId: provider.id, providerName: provider.name });
  } catch (e) {
    console.error('merchant/login error', e);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}