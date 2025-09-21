// pages/api/merchant/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

type Resp =
  | { ok: true; data: { providerId: string; providerName: string } }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { phone, providerName, ownerName } = req.body || {};
    if (!phone || !providerName) {
      return res.status(400).json({ ok: false, error: "phone & providerName required" });
    }

    // upsert user by phone
    const user = await prisma.user.upsert({
      where: { phone },
      update: { name: ownerName || "Merchant Owner" },
      create: { phone, name: ownerName || "Merchant Owner", role: "PROVIDER" },
      select: { id: true },
    });

    // upsert provider by userId
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: { name: providerName, isActive: true, status: "APPROVED" },
      create: {
        userId: user.id,
        name: providerName,
        isActive: true,
        status: "APPROVED",
      },
      select: { id: true, name: true },
    });

    return res.status(200).json({
      ok: true,
      data: { providerId: provider.id, providerName: provider.name },
    });
  } catch (e) {
    console.error("merchant/login error", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
export const config = { runtime: "nodejs" };