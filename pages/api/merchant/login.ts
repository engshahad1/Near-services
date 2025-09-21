// pages/api/merchant/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // من هذا الملف: pages/api/merchant/login.ts -> ../../../lib/prisma
import { UserRole } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // نسمح فقط بـ POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { ownerName, providerName, phone } = (req.body ?? {}) as {
      ownerName?: string;
      providerName?: string;
      phone?: string;
    };

    if (!phone?.trim() || !providerName?.trim()) {
      return res
        .status(400)
        .json({ ok: false, error: "phone & providerName required" });
    }

    const normPhone = phone.trim();
    const owner = (ownerName || "Merchant Owner").trim();
    const providerTitle = providerName.trim();

    // 1) upsert user by unique phone
    const user = await prisma.user.upsert({
      where: { phone: normPhone },
      update: { name: owner, role: UserRole.PROVIDER, isActive: true },
      create: { phone: normPhone, name: owner, role: UserRole.PROVIDER, isActive: true },
    });

    // 2) upsert provider by userId
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: { name: providerTitle, phone: normPhone, isActive: true },
      create: {
        userId: user.id,
        name: providerTitle,
        phone: normPhone,
        isActive: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: { providerId: provider.id, providerName: provider.name },
    });
  } catch (err: any) {
    // لسهولة التشخيص على Vercel
    console.error("merchant/login error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Server error" });
  }
}
