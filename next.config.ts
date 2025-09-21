/** @type {import('next').NextConfig} */
const nextConfig = {
  // لا توقف الـ build بسبب ESLint
  eslint: { ignoreDuringBuilds: true },

  // (اختياري) لا توقف الـ build بسبب أخطاء Typescript
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
