'use client';
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Shield,
  Users,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Play,
  Camera,
  Award,
  Verified,
  ThumbsUp,
  Filter,
  SortDesc,
  MoreVertical,
  Flag,
  Car,
  Sparkles,
  TrendingUp,
  Info
} from 'lucide-react';

interface ServiceProvider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  completedJobs: number;
  responseTime: string;
  photo: string;
  isVerified: boolean;
  isOnline: boolean;
  badges: string[];
  specialties: string[];
  priceRange: {
    min: number;
    max: number;
    unit: string;
  };
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  serviceType: string;
  verified: boolean;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
  popular?: boolean;
}

const ServiceDetailPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // هذا في التطبيق الحقيقي سيأتي من API بناء على معرف الخدمة
  const serviceData = {
    id: 'car-wash',
    title: 'غسيل السيارات المتنقل',
    description: 'خدمة غسيل سيارات شاملة ومتنقلة مع أفضل مقدمي الخدمات المعتمدين في منطقتك. نستخدم أحدث المعدات والمواد الصديقة للبيئة لضمان أفضل النتائج لسيارتك.',
    category: 'خدمات السيارات',
    rating: 4.8,
    reviewCount: 1250,
    totalProviders: 45,
    responseTime: '15 دقيقة',
    tags: ['غسيل خارجي', 'تنظيف داخلي', 'تلميع', 'إطارات', 'محرك'],
    images: [
      'https://images.unsplash.com/photo-1558618047-b2c2c58dc373?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=600&h=400&fit=crop'
    ],
    features: [
      'خدمة متنقلة في موقعك',
      'مواد تنظيف صديقة للبيئة',
      'فريق مدرب ومعتمد',
      'ضمان على الخدمة',
      'متاح 7 أيام في الأسبوع',
      'أسعار تنافسية'
    ],
    serviceArea: 'الرياض وضواحيها',
    isPopular: true,
    discount: 15
  };

  const packages: ServicePackage[] = [
    {
      id: 'basic',
      name: 'الباقة الأساسية',
      description: 'غسيل خارجي شامل للسيارة',
      price: 50,
      duration: '30-45 دقيقة',
      includes: [
        'غسيل خارجي بالصابون والماء',
        'تنظيف الزجاج الأمامي والخلفي',
        'تنظيف الإطارات',
        'تجفيف السيارة'
      ]
    },
    {
      id: 'premium',
      name: 'الباقة المميزة',
      description: 'غسيل شامل داخلي وخارجي',
      price: 120,
      duration: '60-90 دقيقة',
      includes: [
        'غسيل خارجي شامل',
        'تنظيف داخلي للمقاعد والأرضيات',
        'تنظيف لوحة القيادة',
        'تلميع الإطارات',
        'تعطير السيارة',
        'حماية الطلاء'
      ],
      popular: true
    },
    {
      id: 'luxury',
      name: 'الباقة الفاخرة',
      description: 'خدمة VIP مع تفاصيل إضافية',
      price: 200,
      duration: '90-120 دقيقة',
      includes: [
        'جميع خدمات الباقة المميزة',
        'تنظيف المحرك من الخارج',
        'تلميع وحماية الطلاء',
        'تنظيف عميق للمقاعد الجلدية',
        'تنظيف صندوق السيارة',
        'فحص مستوى السوائل'
      ]
    }
  ];

  const providers: ServiceProvider[] = [
    {
      id: '1',
      name: 'أحمد محمد العلي',
      rating: 4.9,
      reviewCount: 156,
      yearsExperience: 5,
      completedJobs: 780,
      responseTime: '10 دقائق',
      photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzQjgyRjYiLz4KPHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUE8L3RleHQ+Cjwvc3ZnPg==',
      isVerified: true,
      isOnline: true,
      badges: ['خبير معتمد', 'الأكثر طلباً', 'استجابة سريعة'],
      specialties: ['غسيل خارجي', 'تنظيف داخلي', 'تلميع'],
      priceRange: { min: 45, max: 180, unit: 'ريال' }
    },
    {
      id: '2',
      name: 'خالد عبدالرحمن',
      rating: 4.7,
      reviewCount: 89,
      yearsExperience: 3,
      completedJobs: 420,
      responseTime: '15 دقيقة',
      photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFRjQ0NDQiLz4KPHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+S0E8L3RleHQ+Cjwvc3ZnPg==',
      isVerified: true,
      isOnline: true,
      badges: ['موثق', 'جودة عالية'],
      specialties: ['غسيل شامل', 'تنظيف محرك'],
      priceRange: { min: 50, max: 190, unit: 'ريال' }
    },
    {
      id: '3',
      name: 'محمد صالح',
      rating: 4.8,
      reviewCount: 203,
      yearsExperience: 7,
      completedJobs: 1200,
      responseTime: '20 دقيقة',
      photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TVM8L3RleHQ+Cjwvc3ZnPg==',
      isVerified: true,
      isOnline: false,
      badges: ['خبرة طويلة', 'عميل مميز'],
      specialties: ['تلميع متقدم', 'حماية طلاء'],
      priceRange: { min: 60, max: 220, unit: 'ريال' }
    }
  ];

  const reviews: Review[] = [
    {
      id: '1',
      customerName: 'سارة أحمد',
      rating: 5,
      date: '2025-08-25',
      comment: 'خدمة ممتازة وسريعة! السيارة أصبحت نظيفة جداً والفريق كان محترف ومهذب.',
      serviceType: 'الباقة المميزة',
      verified: true,
      images: ['https://images.unsplash.com/photo-1558618047-b2c2c58dc373?w=200&h=150&fit=crop']
    },
    {
      id: '2',
      customerName: 'فهد محمد',
      rating: 4,
      date: '2025-08-20',
      comment: 'جودة جيدة ووقت مناسب، لكن كان يمكن الاهتمام أكثر بتنظيف الإطارات.',
      serviceType: 'الباقة الأساسية',
      verified: true
    },
    {
      id: '3',
      customerName: 'نورا عبدالله',
      rating: 5,
      date: '2025-08-18',
      comment: 'أفضل خدمة غسيل سيارات جربتها! الفريق وصل في الوقت المحدد والنتيجة رائعة.',
      serviceType: 'الباقة الفاخرة',
      verified: true,
      images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&h=150&fit=crop', 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=200&h=150&fit=crop']
    }
  ];

  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  const filteredReviews = reviews.filter(review => {
    if (reviewFilter === 'all') return true;
    return review.rating === parseInt(reviewFilter);
  });

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const handleBookService = () => {
    if (!selectedProvider) {
      alert('يرجى اختيار مقدم خدمة أولاً');
      return;
    }
    setShowBookingModal(true);
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <a href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{serviceData.title}</h1>
                <p className="text-sm text-gray-500">{serviceData.category}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Gallery */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
              <div className="relative">
                <img 
                  src={serviceData.images[currentImageIndex]} 
                  alt={serviceData.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  {serviceData.isPopular && (
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1 space-x-reverse">
                      <TrendingUp className="h-3 w-3" />
                      <span>الأكثر طلباً</span>
                    </span>
                  )}
                  {serviceData.discount && (
                    <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                      خصم {serviceData.discount}%
                    </span>
                  )}
                </div>

                {/* Navigation Arrows */}
                {serviceData.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => prev === 0 ? serviceData.images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => prev === serviceData.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Dots */}
                {serviceData.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse">
                    {serviceData.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{serviceData.title}</h1>
                    <div className="flex items-center space-x-4 space-x-reverse mb-3">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-900">{serviceData.rating}</span>
                        <span className="text-gray-500">({serviceData.reviewCount} تقييم)</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{serviceData.totalProviders} مقدم خدمة</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>استجابة خلال {serviceData.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{serviceData.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {serviceData.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-3">
                  {serviceData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Packages */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">اختر الباقة المناسبة</h2>
              
              <div className="grid gap-4">
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                          الأكثر طلباً
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{pkg.duration}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-blue-600">{pkg.price} ريال</div>
                        {serviceData.discount && selectedPackage === pkg.id && (
                          <div className="text-sm text-gray-500 line-through">
                            {Math.round(pkg.price * (1 + serviceData.discount/100))} ريال
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm mb-2">يشمل:</h4>
                      {pkg.includes.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 space-x-reverse">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>

                    {selectedPackage === pkg.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Service Providers */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">مقدمو الخدمة المتاحون</h2>
                <span className="text-sm text-gray-500">{providers.length} مقدم خدمة</span>
              </div>

              <div className="space-y-4">
                {providers.map(provider => (
                  <div
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="relative">
                        <img 
                          src={provider.photo} 
                          alt={provider.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          provider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse mb-1">
                              <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                              {provider.isVerified && (
                                <Verified className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span>{provider.rating}</span>
                                <span>({provider.reviewCount})</span>
                              </div>
                              <span>{provider.yearsExperience} سنوات خبرة</span>
                              <span>{provider.completedJobs} مهمة مكتملة</span>
                            </div>
                          </div>
                          
                          <div className="text-left">
                            <div className="text-lg font-bold text-gray-900">
                              {provider.priceRange.min}-{provider.priceRange.max} {provider.priceRange.unit}
                            </div>
                            <div className="text-sm text-gray-500">
                              استجابة: {provider.responseTime}
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {provider.badges.map((badge, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {badge}
                            </span>
                          ))}
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1">
                          {provider.specialties.map((specialty, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {specialty}
                            </span>
                          ))}
                        </div>

                        {/* Status */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className={`w-2 h-2 rounded-full ${
                              provider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-sm text-gray-600">
                              {provider.isOnline ? 'متصل الآن' : 'غير متصل'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                              <Phone className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {selectedProvider === provider.id && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">التقييمات والآراء</h2>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">جميع التقييمات</option>
                    <option value="5">5 نجوم</option>
                    <option value="4">4 نجوم</option>
                    <option value="3">3 نجوم</option>
                    <option value="2">نجمتان</option>
                    <option value="1">نجمة واحدة</option>
                  </select>
                </div>
              </div>

              {/* Rating Overview */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{serviceData.rating}</div>
                  <div className="flex items-center justify-center space-x-1 space-x-reverse mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${
                          star <= Math.floor(serviceData.rating) 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">بناءً على {serviceData.reviewCount} تقييم</p>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-sm text-gray-600 w-8">{rating} نجوم</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {ratingDistribution[rating as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 3)).map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                            {review.verified && (
                              <Verified className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                            <span>{review.date}</span>
                            <span>•</span>
                            <span>{review.serviceType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 space-x-reverse">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= review.rating 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 space-x-reverse">
                        {review.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`صورة تقييم ${index + 1}`}
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredReviews.length > 3 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAllReviews ? 'عرض أقل' : `عرض جميع التقييمات (${filteredReviews.length})`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {selectedPackageData && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedPackageData.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{selectedPackageData.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedPackageData.price} ريال
                      </span>
                      {serviceData.discount && (
                        <span className="text-sm text-gray-500 line-through">
                          {Math.round(selectedPackageData.price * (1 + serviceData.discount/100))} ريال
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>المدة المتوقعة: {selectedPackageData.duration}</span>
                    </div>

                    {selectedProvider && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            مقدم الخدمة المختار: {providers.find(p => p.id === selectedProvider)?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <button
                      onClick={handleBookService}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      احجز الخدمة الآن
                    </button>
                    
                    <button className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                      طلب عرض سعر
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">معلومات الحجز</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="h-4 w-4" />
                        <span>منطقة الخدمة: {serviceData.serviceArea}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Shield className="h-4 w-4" />
                        <span>ضمان على الخدمة</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <CreditCard className="h-4 w-4" />
                        <span>دفع آمن ومضمون</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">لماذا تختارنا؟</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">مقدمو خدمة معتمدون</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700">ضمان الجودة</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ThumbsUp className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-700">رضا العملاء</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-gray-700">خدمة سريعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">تأكيد الحجز</h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{selectedPackageData?.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedPackageData?.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">السعر:</span>
                  <span className="font-bold text-blue-600">{selectedPackageData?.price} ريال</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">مقدم الخدمة</h4>
                <p className="text-sm text-gray-600">
                  {providers.find(p => p.id === selectedProvider)?.name}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  alert('تم تأكيد الحجز! سيتواصل معك مقدم الخدمة قريباً');
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                تأكيد الحجز
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage;