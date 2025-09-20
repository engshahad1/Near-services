'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Car,
  Home,
  Wrench,
  Smartphone,
  Shirt,
  Utensils,
  Heart,
  GraduationCap,
  Briefcase,
  Palette,
  Users,
  Shield,
  Zap,
  ChevronRight,
  SlidersHorizontal,
  Grid3X3,
  List,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  price: {
    min: number;
    max: number;
    unit: string;
  };
  rating: number;
  reviewCount: number;
  providersCount: number;
  responseTime: string;
  tags: string[];
  image: string;
  isPopular?: boolean;
  isNew?: boolean;
  discount?: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  count: number;
}

const ServicesPage = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const categories: Category[] = [
    { id: 'all', name: 'جميع الخدمات', icon: Grid3X3, color: 'text-gray-700', bgColor: 'bg-gray-100', count: 150 },
    { id: 'automotive', name: 'خدمات السيارات', icon: Car, color: 'text-blue-700', bgColor: 'bg-blue-100', count: 25 },
    { id: 'home', name: 'خدمات منزلية', icon: Home, color: 'text-green-700', bgColor: 'bg-green-100', count: 35 },
    { id: 'maintenance', name: 'صيانة وإصلاح', icon: Wrench, color: 'text-orange-700', bgColor: 'bg-orange-100', count: 20 },
    { id: 'tech', name: 'خدمات تقنية', icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-100', count: 18 },
    { id: 'laundry', name: 'غسيل وتنظيف', icon: Shirt, color: 'text-cyan-700', bgColor: 'bg-cyan-100', count: 15 },
    { id: 'food', name: 'خدمات الطعام', icon: Utensils, color: 'text-red-700', bgColor: 'bg-red-100', count: 12 },
    { id: 'health', name: 'الصحة والجمال', icon: Heart, color: 'text-pink-700', bgColor: 'bg-pink-100', count: 10 },
    { id: 'education', name: 'تعليم وتدريب', icon: GraduationCap, color: 'text-indigo-700', bgColor: 'bg-indigo-100', count: 15 }
  ];

  const services: Service[] = [
    {
      id: 'car-wash',
      title: 'غسيل السيارات',
      description: 'خدمة غسيل سيارات شاملة في موقعك مع مواد تنظيف عالية الجودة',
      category: 'automotive',
      icon: Car,
      price: { min: 50, max: 150, unit: 'ريال' },
      rating: 4.8,
      reviewCount: 1250,
      providersCount: 45,
      responseTime: '15 دقيقة',
      tags: ['غسيل خارجي', 'تنظيف داخلي', 'تلميع'],
      image: 'https://images.unsplash.com/photo-1558618047-b2c2c58dc373?w=400&h=250&fit=crop',
      isPopular: true
    },
    {
      id: 'house-cleaning',
      title: 'تنظيف المنازل',
      description: 'خدمة تنظيف شاملة للمنازل والشقق مع فريق مدرب ومعتمد',
      category: 'home',
      icon: Home,
      price: { min: 80, max: 300, unit: 'ريال' },
      rating: 4.9,
      reviewCount: 890,
      providersCount: 35,
      responseTime: '30 دقيقة',
      tags: ['تنظيف عام', 'تطهير', 'ترتيب'],
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop',
      isPopular: true,
      discount: 20
    },
    {
      id: 'ac-maintenance',
      title: 'صيانة التكييف',
      description: 'خدمات صيانة وإصلاح أجهزة التكييف مع قطع غيار أصلية',
      category: 'maintenance',
      icon: Wrench,
      price: { min: 100, max: 400, unit: 'ريال' },
      rating: 4.7,
      reviewCount: 654,
      providersCount: 28,
      responseTime: '45 دقيقة',
      tags: ['تنظيف فلتر', 'إصلاح', 'صيانة دورية'],
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=250&fit=crop'
    },
    {
      id: 'phone-repair',
      title: 'إصلاح الهواتف',
      description: 'إصلاح جميع أنواع الهواتف الذكية مع ضمان على القطع والخدمة',
      category: 'tech',
      icon: Smartphone,
      price: { min: 70, max: 500, unit: 'ريال' },
      rating: 4.6,
      reviewCount: 432,
      providersCount: 22,
      responseTime: '20 دقيقة',
      tags: ['تغيير شاشة', 'إصلاح بطارية', 'حل مشاكل البرمجة'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      isNew: true
    },
    {
      id: 'laundry-service',
      title: 'خدمة الغسيل',
      description: 'خدمة غسيل وكي الملابس مع استلام وتوصيل مجاني',
      category: 'laundry',
      icon: Shirt,
      price: { min: 15, max: 50, unit: 'ريال/كيلو' },
      rating: 4.5,
      reviewCount: 789,
      providersCount: 18,
      responseTime: '2-24 ساعة',
      tags: ['غسيل عادي', 'تنظيف جاف', 'كي'],
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=250&fit=crop'
    },
    {
      id: 'personal-chef',
      title: 'طباخ شخصي',
      description: 'خدمة طباخ شخصي لإعداد وجبات منزلية شهية ومتنوعة',
      category: 'food',
      icon: Utensils,
      price: { min: 200, max: 800, unit: 'ريال/يوم' },
      rating: 4.9,
      reviewCount: 156,
      providersCount: 12,
      responseTime: '1-2 ساعة',
      tags: ['طبخ منزلي', 'وجبات صحية', 'مناسبات'],
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop',
      isNew: true,
      discount: 15
    },
    {
      id: 'massage-therapy',
      title: 'علاج طبيعي منزلي',
      description: 'جلسات علاج طبيعي ومساج استرخائي في راحة منزلك',
      category: 'health',
      icon: Heart,
      price: { min: 150, max: 350, unit: 'ريال/جلسة' },
      rating: 4.8,
      reviewCount: 298,
      providersCount: 15,
      responseTime: '1-3 ساعات',
      tags: ['مساج استرخائي', 'علاج طبيعي', 'تأهيل'],
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=250&fit=crop'
    },
    {
      id: 'tutoring',
      title: 'دروس خصوصية',
      description: 'معلمون مؤهلون لجميع المراحل الدراسية والتخصصات',
      category: 'education',
      icon: GraduationCap,
      price: { min: 80, max: 200, unit: 'ريال/ساعة' },
      rating: 4.7,
      reviewCount: 567,
      providersCount: 42,
      responseTime: '1-4 ساعات',
      tags: ['رياضيات', 'فيزياء', 'لغات'],
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop',
      isPopular: true
    }
  ];

  const filteredServices = services.filter(service => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      service.title.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      service.tags.some(tag => tag.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

    const matchesPrice = service.price.min >= priceRange[0] && service.price.max <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price.min - b.price.min;
      case 'price-high':
        return b.price.min - a.price.min;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default: // popular
        return b.reviewCount - a.reviewCount;
    }
  });

  const handleServiceClick = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">سوق الخدمات</h1>
                <p className="text-sm text-gray-500">اكتشف أفضل الخدمات في منطقتك</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                title={viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكي'}
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">فلترة</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="ابحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredServices.length}</p>
                  <p className="text-sm text-gray-600">خدمة متاحة</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">200+</p>
                  <p className="text-sm text-gray-600">مقدم خدمة</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-600">متوسط التقييم</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{'< 30'}</p>
                  <p className="text-sm text-gray-600">دقيقة استجابة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories and Filters */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الفئات</h3>
                <div className="space-y-2">
                  {categories.map(category => {
                    const CategoryIcon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedCategory === category.id
                            ? `${category.bgColor} ${category.color} shadow-sm`
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <CategoryIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ترتيب حسب</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popular">الأكثر شعبية</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="price-low">السعر من الأقل للأعلى</option>
                  <option value="price-high">السعر من الأعلى للأقل</option>
                  <option value="newest">الأحدث</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">نطاق السعر</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{priceRange[0]} ريال</span>
                    <span>{priceRange[1]} ريال</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Services Grid/List */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'جميع الخدمات' : categories.find(c => c.id === selectedCategory)?.name}
                <span className="text-gray-500 font-normal mr-2">({sortedServices.length})</span>
              </h2>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedServices.map(service => {
                  const ServiceIcon = service.icon;
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-blue-200"
                    >
                      {/* Service Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                        {/* Badges */}
                        <div className="absolute top-3 right-3 flex flex-col space-y-2">
                          {service.isPopular && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 space-x-reverse">
                              <TrendingUp className="h-3 w-3" />
                              <span>الأكثر طلباً</span>
                            </span>
                          )}
                          {service.isNew && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 space-x-reverse">
                              <Sparkles className="h-3 w-3" />
                              <span>جديد</span>
                            </span>
                          )}
                          {service.discount && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                              خصم {service.discount}%
                            </span>
                          )}
                        </div>

                        {/* Service Icon */}
                        <div className="absolute top-3 left-3 p-2 bg-white/90 rounded-lg backdrop-blur-sm">
                          <ServiceIcon className="h-5 w-5 text-gray-700" />
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {service.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.description}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {service.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{service.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Rating and Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">({service.reviewCount})</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>{service.providersCount} مقدم خدمة</span>
                          </div>
                        </div>

                        {/* Price and Response Time */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {service.price.min === service.price.max
                                ? `${service.price.min} ${service.price.unit}`
                                : `${service.price.min}-${service.price.max} ${service.price.unit}`
                              }
                            </span>
                            {service.discount && (
                              <span className="text-sm text-gray-500 line-through mr-2">
                                {Math.round(service.price.min * (1 + service.discount/100))} ريال
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{service.responseTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {sortedServices.map(service => {
                  const ServiceIcon = service.icon;
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-blue-200 p-6"
                    >
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {/* Service Image */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg backdrop-blur-sm">
                            <ServiceIcon className="h-4 w-4 text-gray-700" />
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {service.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {service.description}
                              </p>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-col space-y-1 mr-4">
                              {service.isPopular && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 space-x-reverse">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>شعبي</span>
                                </span>
                              )}
                              {service.isNew && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 space-x-reverse">
                                  <Sparkles className="h-3 w-3" />
                                  <span>جديد</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {service.tags.slice(0, 4).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Bottom Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                                <span className="text-sm text-gray-500">({service.reviewCount})</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                                <Users className="h-4 w-4" />
                                <span>{service.providersCount}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{service.responseTime}</span>
                              </div>
                            </div>

                            <div className="text-left">
                              <div className="text-lg font-bold text-gray-900">
                                {service.price.min === service.price.max
                                  ? `${service.price.min} ${service.price.unit}`
                                  : `${service.price.min}-${service.price.max} ${service.price.unit}`
                                }
                              </div>
                              {service.discount && (
                                <div className="text-sm text-gray-500 line-through">
                                  {Math.round(service.price.min * (1 + service.discount/100))} ريال
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {sortedServices.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد خدمات</h3>
                <p className="text-gray-600 mb-4">لم نجد أي خدمات تطابق معايير البحث الخاصة بك</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 1000]);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Popular Services Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">الخدمات الأكثر طلباً</h2>
              <p className="text-gray-600">اكتشف الخدمات التي يختارها عملاؤنا بكثرة</p>
            </div>
            <button
              onClick={() => router.push('/services')}
              className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>عرض الكل</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.filter(s => s.isPopular).slice(0, 4).map(service => {
              const ServiceIcon = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 p-6"
                >
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ServiceIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.title}</h3>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{service.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      من {service.price.min} {service.price.unit}
                    </span>
                    <span className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                      <Award className="h-4 w-4" />
                      <span>معتمد</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لماذا تختار سوق الخدمات؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نضمن لك تجربة آمنة وموثوقة مع أفضل مقدمي الخدمات المعتمدين
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ضمان الجودة</h3>
              <p className="text-gray-600 text-sm">جميع مقدمي الخدمات معتمدون ومدققون</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">استجابة سريعة</h3>
              <p className="text-gray-600 text-sm">خدمة عملاء متاحة 24/7 لمساعدتك</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">رضا العملاء</h3>
              <p className="text-gray-600 text-sm">أكثر من 95% من عملائنا راضون عن خدماتنا</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)}></div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
