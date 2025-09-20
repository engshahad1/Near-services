// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma, UserRole } from '@prisma/client';
import prisma from '../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const ALLOWED_CREATE_FIELDS = [
  'name',
  'email',
  'phone',
  'avatar',   // اختياري في السكيمة
  'role',     // CUSTOMER | PROVIDER | ADMIN
  'isActive', // boolean
] as const;

function toBoolean(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return undefined;
}
function isEmail(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isPhone(v: unknown): v is string {
  return typeof v === 'string' && v.replace(/\s+/g, '').length >= 6;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    // ========================= GET =========================
    if (req.method === 'GET') {
      const {
        page = '1',
        pageSize = '10',
        q,                // name/email/phone/id
        role,             // CUSTOMER | PROVIDER | ADMIN
        isActive,         // 'true' | 'false'
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const take = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
      const skip = (pageNum - 1) * take;

      const where: Prisma.UserWhereInput = {};

      if (q) {
        where.OR = [
          { name:  { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { id:    { equals: q } },
        ];
      }

      if (role) {
        const r = role.toUpperCase() as UserRole;
        if (['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(r)) where.role = r;
      }

      if (typeof isActive !== 'undefined' && ['true', 'false'].includes(isActive.toLowerCase())) {
        where.isActive = isActive.toLowerCase() === 'true';
      }

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: { select: { orders: true, reviews: true, addresses: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        ok: true,
        data: {
          items,
          pagination: { page: pageNum, pageSize: take, total, totalPages: Math.ceil(total / take) },
        },
      });
    }

    // ========================= POST =========================
    if (req.method === 'POST') {
      const body = (req.body ?? {}) as Record<string, any>;
      const payload: Record<string, any> = {};

      for (const k of ALLOWED_CREATE_FIELDS) {
        if (k in body) payload[k] = body[k as keyof typeof body];
      }

      // required
      if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
        return res.status(400).json({ ok: false, error: 'name مطلوب.' });
      }
      if (!isEmail(payload.email)) {
        return res.status(400).json({ ok: false, error: 'email غير صالح.' });
      }
      if (!isPhone(payload.phone)) {
        return res.status(400).json({ ok: false, error: 'phone غير صالح.' });
      }

      // role
      const role = String(payload.role ?? 'CUSTOMER').toUpperCase() as UserRole;
      if (!['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ ok: false, error: 'role غير صالح.' });
      }

      // isActive
      let isActiveVal = true;
      if (typeof payload.isActive !== 'undefined') {
        const b = toBoolean(payload.isActive);
        if (typeof b === 'undefined') return res.status(400).json({ ok: false, error: 'isActive غير صالح.' });
        isActiveVal = b;
      }

      const data: Prisma.UserCreateInput = {
        name: String(payload.name).trim(),
        email: String(payload.email).trim(),
        phone: String(payload.phone).replace(/\s+/g, ''),
        avatar: payload.avatar ? String(payload.avatar) : null,
        role,
        isActive: isActiveVal,
      };

      try {
        const user = await prisma.user.create({
          data,
          select: {
            id: true, name: true, email: true, phone: true, avatar: true, role: true, isActive: true, createdAt: true,
          },
        });
        return res.status(201).json({ ok: true, data: user });
      } catch (e: any) {
        if (e?.code === 'P2002') {
          return res.status(409).json({ ok: false, error: 'البريد أو الهاتف مستخدم مسبقًا.' });
        }
        throw e;
      }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('users/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
