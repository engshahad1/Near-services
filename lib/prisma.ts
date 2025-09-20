// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // منع تكرار إنشاء PrismaClient في وضع التطوير (Hot Reload في Next.js)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// ✅ هنا نضيف default export
export default prisma;
