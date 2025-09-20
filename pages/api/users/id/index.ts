// pages/api/users/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Prisma, UserRole } from '@prisma/client';
import prisma from '../../../../lib/prisma';

type ApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

const ALLOWED_UPDATE_FIELDS = [
  'name',
  'email',
  'phone',
  'avatar',     // عندك بالسكيمة: avatar (اختياري)
  'role',       // UserRole: CUSTOMER | PROVIDER | ADMIN
  'isActive',   // boolean
] as const;

// helpers
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
  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).json({ ok: false, error: 'id مطلوب.' });

  try {
    // ========== GET /api/users/:id ==========
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          addresses: {
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { orders: true, reviews: true, addresses: true },
          },
          provider: {
            select: { id: true, name: true, status: true, isVerified: true },
          },
        },
      });
      if (!user) return res.status(404).json({ ok: false, error: 'المستخدم غير موجود.' });

      return res.status(200).json({ ok: true, data: user });
    }

    // ========== PUT /api/users/:id ==========
    if (req.method === 'PUT') {
      const body = (req.body ?? {}) as Record<string, any>;
      const patch: Prisma.UserUpdateInput = {};

      for (const key of ALLOWED_UPDATE_FIELDS) {
        if (!(key in body)) continue;

        switch (key) {
          case 'name': {
            const v = String(body.name ?? '').trim();
            if (!v) return res.status(400).json({ ok: false, error: 'name غير صالح.' });
            patch.name = v;
            break;
          }
          case 'email': {
            if (!isEmail(body.email)) {
              return res.status(400).json({ ok: false, error: 'email غير صالح.' });
            }
            patch.email = body.email;
            break;
          }
          case 'phone': {
            if (!isPhone(body.phone)) {
              return res.status(400).json({ ok: false, error: 'phone غير صالح.' });
            }
            patch.phone = String(body.phone).replace(/\s+/g, '');
            break;
          }
          case 'avatar': {
            patch.avatar = body.avatar ? String(body.avatar) : null;
            break;
          }
          case 'role': {
            const r = String(body.role || '').toUpperCase() as UserRole;
            if (!['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(r)) {
              return res.status(400).json({ ok: false, error: 'role غير صالح.' });
            }
            patch.role = r;
            break;
          }
          case 'isActive': {
            const b = toBoolean(body.isActive);
            if (typeof b === 'undefined') {
              return res.status(400).json({ ok: false, error: 'isActive غير صالح.' });
            }
            patch.isActive = b;
            break;
          }
          default:
            break;
        }
      }

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ ok: false, error: 'لا توجد حقول صالحة للتحديث.' });
      }

      try {
        const updated = await prisma.user.update({
          where: { id },
          data: patch,
        });
        return res.status(200).json({ ok: true, data: updated });
      } catch (e: any) {
        // معالجة تعارض البريد/الهاتف (unique)
        if (e?.code === 'P2002') {
          // Prisma unique constraint violation
          return res.status(409).json({ ok: false, error: 'البريد أو الهاتف مستخدم مسبقًا.' });
        }
        throw e;
      }
    }

    // ========== DELETE /api/users/:id ==========
    // تعطيل ناعم: نخلي isActive=false ونطلّع البيانات (أفضل من الحذف النهائي لأن عندك علاقات Orders/Addresses/Reviews)
    if (req.method === 'DELETE') {
      const current = await prisma.user.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ ok: false, error: 'المستخدم غير موجود.' });

      const disabled = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: { id: true, isActive: true, email: true, phone: true, name: true, role: true },
      });

      return res.status(200).json({ ok: true, data: disabled });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('users/[id]/index error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}