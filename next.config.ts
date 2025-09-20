// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: 'build',          // بدّل .next إلى build
  reactStrictMode: true,
  // swcMinify: true,  ← احذف هذا السطر نهائي
};

export default nextConfig;
