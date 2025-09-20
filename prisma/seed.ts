// prisma/seed.ts
import { PrismaClient, ServiceType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // 1) User تجريبي (لازم phone لأنه مطلوب في السكيما)
  const demoUser = await prisma.user.upsert({
    where: { email: 'vendor.demo@near.local' },
    update: {},
    create: {
      id: 'demo-user-1',
      name: 'Vendor Demo User',
      email: 'vendor.demo@near.local',
      phone: '0500000000', // ✅ مهم
    },
  });

  // 2) Providers مربوطين بالمستخدم
  const providers = [
    { id: 'demo-vendor-1', name: 'محل الغسيل السريع' },
    { id: 'demo-vendor-2', name: 'محل التكييف المركزي' },
    { id: 'demo-vendor-3', name: 'نسخ المفاتيح الذكي' },
  ];

  for (const p of providers) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        user: { connect: { id: demoUser.id } },
      },
      create: {
        id: p.id,
        name: p.name,
        user: { connect: { id: demoUser.id } },
      },
    });
  }

  // 3) Services (كما هي من قبل)
  const services = [
    { id: 'svc_car_wash', name: 'غسيل السيارات', description: 'غسيل وتنظيف شامل في موقع العميل', price: 50, durationMinutes: 45, imageUrl: '/images/services/car-wash.jpg', type: ServiceType.ON_SITE, rating: 4.8, reviewCount: 1250 },
    { id: 'svc_laundry', name: 'مغسلة الملابس', description: 'غسيل وكي الملابس مع خدمة استلام وتسليم 24 ساعة', price: 25, durationMinutes: 1440, imageUrl: '/images/services/laundry.jpg', type: ServiceType.PICKUP_DELIVERY, rating: 4.9, reviewCount: 890 },
    { id: 'svc_keys', name: 'نسخ مفاتيح', description: 'نسخ جميع أنواع المفاتيح بدقة عالية', price: 15, durationMinutes: 120, imageUrl: '/images/services/keys.jpg', type: ServiceType.PICKUP_DELIVERY, rating: 4.7, reviewCount: 650 },
    { id: 'svc_phone_repair', name: 'صيانة الجوالات', description: 'إصلاح وصيانة الهواتف الذكية من جميع الأنواع', price: 80, durationMinutes: 480, imageUrl: '/images/services/phones.jpg', type: ServiceType.PICKUP_DELIVERY, rating: 4.6, reviewCount: 1100 },
    { id: 'svc_plumbing', name: 'سباكة', description: 'خدمات السباكة والإصلاحات الطارئة على مدار الساعة', price: 100, durationMinutes: 180, imageUrl: '/images/services/plumbing.jpg', type: ServiceType.ON_SITE, rating: 4.8, reviewCount: 780 },
    { id: 'svc_electric', name: 'كهرباء', description: 'أعمال الكهرباء والصيانة بأيدي فنيين مختصين', price: 120, durationMinutes: 240, imageUrl: '/images/services/electric.jpg', type: ServiceType.ON_SITE, rating: 4.7, reviewCount: 920 },
    { id: 'svc_ac', name: 'صيانة التكييف', description: 'صيانة وتنظيف وإصلاح المكيفات', price: 150, durationMinutes: 300, imageUrl: '/images/services/ac.jpg', type: ServiceType.ON_SITE, rating: 4.9, reviewCount: 1350 },
  ];

  for (const s of services) {
    await prisma.service.upsert({ where: { id: s.id }, update: {}, create: s });
  }

  // 4) Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'خصم ترحيبي 10%',
      type: 'PERCENTAGE',
      value: 10,
      validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
    },
  });

  console.log('✅ Seed done.');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
