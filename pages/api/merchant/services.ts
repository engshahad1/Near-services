import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

type Resp = { ok: true; data: any } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  try {
    if (req.method === "GET") {
      // جلب الخدمات
      const services = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
      });
      return res.status(200).json({ ok: true, data: services });
    }

    if (req.method === "POST") {
      // إضافة خدمة جديدة
      const { name, price } = req.body ?? {};
      if (!name || !price) {
        return res.status(400).json({ ok: false, error: "الاسم والسعر مطلوبان" });
      }

      const created = await prisma.service.create({
        data: {
          name,
          price: parseFloat(price),
        },
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
      });

      return res.status(201).json({ ok: true, data: created });
    }

    if (req.method === "DELETE") {
      // حذف خدمة
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ ok: false, error: "المعرف مطلوب" });
      }

      await prisma.service.delete({ where: { id } });
      return res.status(200).json({ ok: true, data: { id, deleted: true } });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e) {
    console.error("merchant/services error", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
