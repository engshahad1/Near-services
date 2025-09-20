'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Car, Shirt, Key, Smartphone, Wrench, Zap, Droplets, Wind,
  MapPin, Clock, Star, ArrowRight, Search, Menu, X,
  Shield, CheckCircle, Users, Award, Headphones, Phone,
} from 'lucide-react';

type ApiService = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number | null;
  imageUrl: string | null;
  type: 'ON_SITE' | 'PICKUP_DELIVERY';
  rating: number;
  reviewCount: number;
};

type UiService = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  type: 'ON_SITE' | 'PICKUP_DELIVERY';
  typeLabel: 'في الموقع' | 'استلام وتوصيل';
  durationLabel: string;
  gradient: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  features: string[];
};

const stats = [
  { label: 'عميل راضي', value: '15,000+', icon: Users },
  { label: 'خدمة مكتملة', value: '50,000+', icon: CheckCircle },
  { label: 'مقدم خدمة معتمد', value: '500+', icon: Award },
  { label: 'دعم على مدار الساعة', value: '24/7', icon: Headphones },
];

const testimonials = [
  { name:'أحمد العلي', service:'غسيل السيارات', rating:5, comment:'خدمة ممتازة وسريعة. غسلوا السيارة في البيت وتركوها نظيفة جداً.', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
  { name:'فاطمة السعد', service:'مغسلة الملابس', rating:5, comment:'استلموا الملابس من البيت وردوها نظيفة ومكوية. خدمة رائعة.', avatar:'https://images.unsplash.com/photo-1494790108755-2616b69e4d0f?w=40&h=40&fit=crop&crop=face' },
  { name:'محمد القحطاني', service:'سباكة', rating:5, comment:'أصلحوا المشكلة بسرعة ومهنية عالية. أنصح بهم بقوة.', avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
];

// === Helpers ===
const toHours = (m?: number | null) => {
  if (!m || m <= 0) return '—';
  if (m < 60) return `${m} دقيقة`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} ساعة ${r} دقيقة` : `${h} ساعة`;
};

const priceLabel = (p: number) => `من ${Math.max(0, Math.round(p))} ريال`;

const guessEn = (name: string) => {
  const s = name.toLowerCase();
  if (s.includes('غسيل') && s.includes('سي')) return 'Car Wash';
  if (s.includes('مغسل') || s.includes('ملابس')) return 'Laundry';
  if (s.includes('مفتاح') || s.includes('مفاتيح')) return 'Key Duplication';
  if (s.includes('جوال') || s.includes('هاتف')) return 'Phone Repair';
  if (s.includes('سباك') || s.includes('سباكة')) return 'Plumbing';
  if (s.includes('كهرب')) return 'Electrical';
  if (s.includes('تكييف') || s.includes('مكيف')) return 'AC Repair';
  return 'General Service';
};

const pickIcon = (name: string, type: UiService['type']) => {
  const s = name.toLowerCase();
  if (s.includes('سي') || s.includes('غسيل')) return Car;
  if (s.includes('مغسل') || s.includes('ملابس')) return Shirt;
  if (s.includes('مفتاح') || s.includes('مفاتيح')) return Key;
  if (s.includes('جوال') || s.includes('هاتف')) return Smartphone;
  if (s.includes('سباك') || s.includes('سباكة')) return Droplets;
  if (s.includes('كهرب')) return Zap;
  if (s.includes('تكييف') || s.includes('مكيف')) return Wind;
  return type === 'ON_SITE' ? Wrench : Smartphone;
};

const pickGradient = (name: string) => {
  const s = name.toLowerCase();
  if (s.includes('سي') || s.includes('غسيل')) return 'from-blue-500 to-cyan-500';
  if (s.includes('مغسل') || s.includes('ملابس')) return 'from-purple-500 to-pink-500';
  if (s.includes('مفتاح') || s.includes('مفاتيح')) return 'from-amber-500 to-orange-500';
  if (s.includes('جوال') || s.includes('هاتف')) return 'from-green-500 to-emerald-500';
  if (s.includes('سباك') || s.includes('سباكة')) return 'from-blue-600 to-blue-800';
  if (s.includes('كهرب')) return 'from-yellow-500 to-orange-600';
  if (s.includes('تكييف') || s.includes('مكيف')) return 'from-cyan-500 to-blue-600';
  return 'from-gray-600 to-gray-800';
};

const defaultFeatures = (name: string) => {
  const s = name.toLowerCase();
  if (s.includes('سي') || s.includes('غسيل')) return ['غسيل خارجي', 'تنظيف داخلي', 'تلميع الإطارات'];
  if (s.includes('مغسل') || s.includes('ملابس')) return ['غسيل', 'كي', 'استلام وتوصيل'];
  if (s.includes('مفتاح') || s.includes('مفاتيح')) return ['مفاتيح منزلية', 'مفاتيح سيارات', 'مفاتيح مكاتب'];
  if (s.includes('جوال') || s.includes('هاتف')) return ['تغيير شاشات', 'إصلاح البطارية', 'حل مشاكل البرمجيات'];
  if (s.includes('سباك') || s.includes('سباكة')) return ['إصلاح التسريبات', 'تسليك المجاري', 'تركيب الأدوات الصحية'];
  if (s.includes('كهرب')) return ['تركيب الإضاءة', 'إصلاح الأعطال', 'فحص الكهرباء'];
  if (s.includes('تكييف') || s.includes('مكيف')) return ['تنظيف المكيفات', 'إصلاح الأعطال', 'تعبئة الفريون'];
  return ['فحص أولي', 'تنفيذ سريع', 'ضمان جودة'];
};

const mapApiToUi = (s: ApiService): UiService => {
  const nameEn = guessEn(s.name);
  const Icon = pickIcon(s.name, s.type);
  return {
    id: s.id,
    name: s.name,
    nameEn,
    description: s.description ?? '',
    priceLabel: priceLabel(s.price ?? 0),
    rating: s.rating ?? 0,
    reviewCount: s.reviewCount ?? 0,
    type: s.type,
    typeLabel: s.type === 'ON_SITE' ? 'في الموقع' : 'استلام وتوصيل',
    durationLabel: toHours(s.durationMinutes),
    gradient: pickGradient(s.name),
    icon: Icon,
    features: defaultFeatures(s.name),
  };
};

const SmartServicesHomepage: React.FC = () => {
  const [services, setServices] = useState<UiService[]>([]);
  const [selectedService, setSelectedService] = useState<UiService | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load services from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const url = `/api/services?page=1&pageSize=50${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled && json?.ok) {
          const items: ApiService[] = json.data.items;
          setServices(items.map(mapApiToUi));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [searchQuery]);

  const filteredServices = useMemo(() => services, [services]);

  const handleServiceClick = (service: UiService) => setSelectedService(service);
  const handleBookService = (serviceId: string) => {
    window.location.href = `/booking?service=${serviceId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2 shadow-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">الخدمات الذكية</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Smart Services</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <nav className="flex gap-6">
                <a href="#services" className="nav-link">الخدمات</a>
                <a href="#about" className="nav-link">من نحن</a>
                <a href="/tracking" className="nav-link">تتبع طلب</a>
                <a href="#contact" className="nav-link">تواصل معنا</a>
              </nav>
              <button className="btn-gradient px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                تسجيل الدخول
              </button>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="فتح القائمة"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-gray-600 hover:text-gray-900 py-2">الخدمات</a>
              <a href="#about" className="block text-gray-600 hover:text-gray-900 py-2">من نحن</a>
              <a href="/tracking" className="block text-gray-600 hover:text-gray-900 py-2">تتبع طلب</a>
              <a href="#contact" className="block text-gray-600 hover:text-gray-900 py-2">تواصل معنا</a>
              <button className="w-full btn-gradient px-4 py-2 rounded-lg mt-2">تسجيل الدخول</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            خدماتك اليومية
            <span className="text-gradient block mt-2">في متناول يدك</span>
          </h2>
          <p className="lead text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            منصة ذكية تربطك بأفضل مزوّدي الخدمات في منطقتك. اطلب خدمتك بسهولة وتابع التنفيذ خطوة بخطوة مع ضمان الجودة والسرعة
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن الخدمة التي تحتاجها... (مثل: غسيل السيارات)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full py-4 pr-12 pl-6 text-lg border-2 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="light-card">
                    <IconComponent className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services */}
        <div id="services" className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">خدماتنا المميزة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div key={service.id} className="service-card group" onClick={() => handleServiceClick(service)}>
                  <div className={`bg-gradient-to-r ${service.gradient} p-6 text-white relative overflow-hidden`}>
                    <div className="flex justify-between items-start mb-4">
                      <IconComponent className="h-10 w-10 z-10 relative" />
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                        {service.typeLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1 z-10 relative">{service.name}</h3>
                    <p className="text-white/80 text-sm z-10 relative">{service.nameEn}</p>

                    {/* Background icon pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                      <IconComponent className="w-full h-full" />
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{service.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({service.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{service.durationLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{service.priceLabel}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBookService(service.id); }}
                        className="btn-gradient px-4 py-2 rounded-lg flex items-center gap-2 group-hover:shadow-lg transition-all"
                      >
                        <span>اطلب الآن</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16 testimonials">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">ماذا يقول عملاؤنا</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <div key={index} className="light-card">
                <div className="flex items-center mb-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="mr-3">
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.service}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16" id="about">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">لماذا تختارنا؟</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold mb-2">أمان وثقة</h4>
              <p className="text-gray-600">جميع مقدمي الخدمة معتمدين ومؤمن عليهم لضمان سلامتك</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold mb-2">سرعة في التنفيذ</h4>
              <p className="text-gray-600">خدمة سريعة وموثقة مع تتبع مباشر لحالة طلبك</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold mb-2">جودة مضمونة</h4>
              <p className="text-gray-600">ضمان الجودة مع إمكانية استرداد المبلغ في حالة عدم الرضا</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="cta bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">جاهز لطلب خدمتك؟</h3>
            <p className="text-blue-100 mb-6 text-lg">
              اختر الخدمة، حدد الموقع والوقت، وادفع بأمان. سنتولى الباقي!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                تصفح جميع الخدمات
              </button>
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="h-5 w-5" />
                <span>خدماتنا متوفرة في الرياض وضواحيها</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="light-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className={`bg-gradient-to-r ${selectedService.gradient} p-6 text-white`}>
              <div className="flex justify-between items-start mb-4">
                {(() => { const Icon = selectedService.icon; return <Icon className="h-12 w-12" />; })()}
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  aria-label="إغلاق النافذة"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <h2 className="text-3xl font-bold mb-2">{selectedService.name}</h2>
              <p className="text-white/80 text-lg">{selectedService.nameEn}</p>
            </div>

            <div className="p-6">
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">{selectedService.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">التقييم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{selectedService.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({selectedService.reviewCount} تقييم)</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">المدة المتوقعة</span>
                  </div>
                  <span className="text-lg font-medium text-gray-900">{selectedService.durationLabel}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">ما نقدمه لك:</h4>
                <ul className="space-y-2">
                  {selectedService.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-gray-900">{selectedService.priceLabel}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedService.type === 'ON_SITE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedService.typeLabel}
                  </span>
                </div>

                <button
                  onClick={() => handleBookService(selectedService.id)}
                  className="w-full btn-gradient py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all"
                >
                  اطلب الخدمة الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">الخدمات الذكية</h3>
                  <p className="text-gray-400">Smart Services Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                منصتك الموثوقة لجميع الخدمات اليومية في المملكة العربية السعودية.
                نربطك بأفضل مقدمي الخدمات مع ضمان الجودة والسرعة في التنفيذ.
              </p>
              <div className="flex gap-4">
                <div className="bg-gray-800 p-2 rounded-lg"><Phone className="h-5 w-5" /></div>
                <div className="bg-gray-800 p-2 rounded-lg"><MapPin className="h-5 w-5" /></div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">الخدمات</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">غسيل السيارات</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">مغسلة الملابس</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">سباكة</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">كهرباء</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">روابط مهمة</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">من نحن</a></li>
                <li><a href="/tracking" className="text-gray-400 hover:text-white transition-colors">تتبع طلب</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p className="text-gray-400">&copy; 2025 منصة الخدمات الذكية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartServicesHomepage;
