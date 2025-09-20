'use client';
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  ArrowLeft, 
  Check,
  Plus,
  Minus,
  Star,
  Shield,
  Truck,
  User,
  Phone,
  AlertCircle,
  Zap,
  Car,
  Shirt,
  Key,
  Smartphone,
  Wrench,
  Droplets,
  Wind
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  titleEn: string;
  basePrice: number;
  rating: number;
  type: 'on-site' | 'pickup-delivery';
  description: string;
  icon: any;
  gradient: string;
}

interface Extra {
  id: string;
  title: string;
  price: number;
}

interface PaymentMethod {
  id: string;
  title: string;
  icon: any;
  color: string;
}

const ServiceBookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [bookingData, setBookingData] = useState({
    address: '',
    building: '',
    apartment: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    paymentMethod: 'mada',
    extras: [] as string[]
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const services: Service[] = [
    {
      id: 'car_wash',
      title: 'غسيل السيارات',
      titleEn: 'Car Wash',
      basePrice: 50,
      rating: 4.8,
      type: 'on-site',
      description: 'غسيل وتنظيف شامل لسيارتك في موقعك',
      icon: Car,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'laundry',
      title: 'مغسلة الملابس',
      titleEn: 'Laundry',
      basePrice: 25,
      rating: 4.9,
      type: 'pickup-delivery',
      description: 'غسيل وكي الملابس مع التوصيل',
      icon: Shirt,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'key_copy',
      title: 'نسخ مفاتيح',
      titleEn: 'Key Duplication',
      basePrice: 15,
      rating: 4.7,
      type: 'pickup-delivery',
      description: 'نسخ جميع أنواع المفاتيح',
      icon: Key,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'phone_repair',
      title: 'صيانة الجوالات',
      titleEn: 'Phone Repair',
      basePrice: 80,
      rating: 4.6,
      type: 'pickup-delivery',
      description: 'إصلاح وصيانة الهواتف الذكية',
      icon: Smartphone,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'plumbing',
      title: 'سباكة',
      titleEn: 'Plumbing',
      basePrice: 100,
      rating: 4.8,
      type: 'on-site',
      description: 'خدمات السباكة والصيانة الطارئة',
      icon: Droplets,
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      id: 'electrical',
      title: 'كهرباء',
      titleEn: 'Electrical',
      basePrice: 120,
      rating: 4.7,
      type: 'on-site',
      description: 'أعمال الكهرباء والصيانة',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'ac_repair',
      title: 'صيانة التكييف',
      titleEn: 'AC Repair',
      basePrice: 150,
      rating: 4.9,
      type: 'on-site',
      description: 'صيانة وإصلاح أجهزة التكييف',
      icon: Wind,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'general_maintenance',
      title: 'صيانة عامة',
      titleEn: 'General Maintenance',
      basePrice: 75,
      rating: 4.5,
      type: 'on-site',
      description: 'أعمال الصيانة والإصلاح المنزلي',
      icon: Wrench,
      gradient: 'from-gray-600 to-gray-800'
    }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const extras: Extra[] = [
    { id: 'interior', title: 'تنظيف داخلي', price: 20 },
    { id: 'wax', title: 'شمع حماية', price: 30 },
    { id: 'tires', title: 'تلميع الإطارات', price: 15 },
    { id: 'engine', title: 'تنظيف المحرك', price: 25 },
    { id: 'express', title: 'خدمة سريعة', price: 35 },
    { id: 'weekend', title: 'خدمة نهاية الأسبوع', price: 10 }
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: 'mada', title: 'بطاقة مدى', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'visa', title: 'فيزا/ماستركارد', icon: CreditCard, color: 'bg-green-500' },
    { id: 'apple_pay', title: 'Apple Pay', icon: CreditCard, color: 'bg-gray-900' },
    { id: 'stc_pay', title: 'STC Pay', icon: CreditCard, color: 'bg-purple-500' }
  ];

  // تحديث السعر عند تغيير الخدمات الإضافية
  useEffect(() => {
    if (selectedService) {
      const extrasTotal = bookingData.extras.reduce((sum, extraId) => {
        const extra = extras.find(e => e.id === extraId);
        return sum + (extra ? extra.price : 0);
      }, 0);
      const subtotal = selectedService.basePrice + extrasTotal;
      const vat = subtotal * 0.15;
      setTotalPrice(subtotal + vat);
    }
  }, [bookingData.extras, selectedService]);

  // تحديد الخدمة المختارة من URL أو الافتراضي
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service') || 'car_wash';
    setSelectedServiceId(serviceParam);
    
    const service = services.find(s => s.id === serviceParam);
    if (service) {
      setSelectedService(service);
    }
  }, []);

  const toggleExtra = (extraId: string) => {
    setBookingData(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(id => id !== extraId)
        : [...prev.extras, extraId]
    }));
  };

  const isStepComplete = (step: number) => {
    switch(step) {
      case 1:
        return bookingData.address.trim() && bookingData.phone.trim();
      case 2:
        return bookingData.date && bookingData.time;
      case 3:
        return bookingData.paymentMethod;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && isStepComplete(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    
    // محاكاة API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(4);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(0) + ' ريال';
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 transition-colors ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>رجوع</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">طلب خدمة</h1>
              <p className="text-sm text-gray-500">{selectedService.title}</p>
            </div>
            
            <a 
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              الغاء
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep === step 
                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg' 
                    : isStepComplete(step)
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {isStepComplete(step) && currentStep > step ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
                <span className={`text-xs mt-2 transition-colors ${
                  currentStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {step === 1 && 'العنوان والتواصل'}
                  {step === 2 && 'الوقت والخدمات'}
                  {step === 3 && 'الدفع'}
                  {step === 4 && 'التأكيد'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              {/* Step 1: Address & Contact */}
              {currentStep === 1 && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">عنوان الخدمة</h2>
                      <p className="text-gray-600">أدخل العنوان ومعلومات التواصل</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="form-label">
                        العنوان الكامل *
                      </label>
                      <textarea
                        value={bookingData.address}
                        onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="مثال: شارع الملك فهد، حي النخيل، الرياض"
                        className="input-field"
                        rows={3}
                        required
                      />
                      <p className="form-help">
                        اكتب العنوان بالتفصيل ليتمكن مقدم الخدمة من الوصول إليك
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          رقم المبنى
                        </label>
                        <input
                          type="text"
                          value={bookingData.building}
                          onChange={(e) => setBookingData(prev => ({ ...prev, building: e.target.value }))}
                          placeholder="رقم المبنى"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          رقم الشقة
                        </label>
                        <input
                          type="text"
                          value={bookingData.apartment}
                          onChange={(e) => setBookingData(prev => ({ ...prev, apartment: e.target.value }))}
                          placeholder="رقم الشقة (اختياري)"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        رقم الجوال *
                      </label>
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="05xxxxxxxx"
                        className="input-field"
                        dir="ltr"
                        style={{ textAlign: 'left' }}
                        required
                      />
                      <p className="form-help">
                        سيتم استخدام هذا الرقم للتواصل معك وتأكيد الطلب
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">معلوماتك في أمان</p>
                          <p className="text-sm text-blue-700">
                            نحن نلتزم بحماية خصوصيتك وعدم مشاركة معلوماتك مع أطراف ثالثة. 
                            جميع البيانات محمية ومشفرة.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Date, Time & Extras */}
              {currentStep === 2 && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">موعد الخدمة</h2>
                      <p className="text-gray-600">اختر التاريخ والوقت المناسب</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="form-label">
                        التاريخ *
                      </label>
                      <input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                        min={getTomorrowDate()}
                        className="input-field"
                        required
                      />
                      <p className="form-help">
                        يمكن طلب الخدمة من الغد فصاعداً
                      </p>
                    </div>

                    <div>
                      <label className="form-label">
                        الوقت المفضل *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, time }))}
                            className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                              bookingData.time === time
                                ? 'border-purple-500 bg-purple-500 text-white shadow-md'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        خدمات إضافية
                      </label>
                      <div className="space-y-3">
                        {extras.map((extra) => (
                          <div 
                            key={extra.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              bookingData.extras.includes(extra.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleExtra(extra.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  bookingData.extras.includes(extra.id)
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300'
                                }`}>
                                  {bookingData.extras.includes(extra.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className="font-medium text-gray-900">{extra.title}</span>
                              </div>
                              <span className="font-semibold text-gray-900">+{formatPrice(extra.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        ملاحظات إضافية
                      </label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="أي تعليمات خاصة أو ملاحظات لمقدم الخدمة..."
                        className="textarea-field"
                        rows={3}
                      />
                      <p className="form-help">
                        مثال: يوجد كلب في البيت، الدخول من الباب الخلفي، إلخ
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">طريقة الدفع</h2>
                      <p className="text-gray-600">اختر طريقة الدفع المفضلة</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            bookingData.paymentMethod === method.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.id }))}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              bookingData.paymentMethod === method.id
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {bookingData.paymentMethod === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className={`${method.color} p-2 rounded`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{method.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">ضمان الاسترداد</p>
                        <p className="text-sm text-amber-700">
                          الدفع آمن ومضمون 100%. في حالة عدم تنفيذ الخدمة كما هو متفق عليه، 
                          سيتم استرداد المبلغ كاملاً خلال 24 ساعة.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="p-6">
                  <div className="text-center mb-8">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تأكيد طلبك!</h2>
                    <p className="text-gray-600">رقم الطلب: #SS{Date.now().toString().slice(-6)}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">ملخص الطلب</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الخدمة:</span>
                        <span className="font-medium">{selectedService.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">التاريخ:</span>
                        <span className="font-medium">{bookingData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الوقت:</span>
                        <span className="font-medium">{bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">العنوان:</span>
                        <span className="font-medium">{bookingData.address.substring(0, 50)}...</span>
                      </div>
                      {bookingData.extras.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">الخدمات الإضافية:</span>
                          <span className="font-medium">{bookingData.extras.length} خدمة</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">الإجمالي:</span>
                        <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <a
                      href="/tracking"
                      className="w-full btn-gradient py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all block text-center"
                    >
                      تتبع الطلب
                    </a>
                    <a
                      href="/"
                      className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors block text-center"
                    >
                      العودة للرئيسية
                    </a>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="px-6 py-4 bg-gray-50 flex justify-between border-t">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      currentStep === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white border border-gray-200'
                    }`}
                  >
                    رجوع
                  </button>
                  <button
                    onClick={currentStep === 3 ? handleSubmit : nextStep}
                    disabled={!isStepComplete(currentStep) || isLoading}
                    className={`px-8 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      isStepComplete(currentStep) && !isLoading
                        ? 'btn-gradient hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>
                      {currentStep === 3 ? 'تأكيد الطلب' : 'التالي'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`bg-gradient-to-r ${selectedService.gradient} p-3 rounded-lg`}>
                    <selectedService.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedService.title}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{selectedService.rating}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">
                        {selectedService.type === 'on-site' ? 'خدمة في الموقع' : 'استلام وتوصيل'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الخدمة الأساسية</span>
                      <span className="font-medium">{formatPrice(selectedService.basePrice)}</span>
                    </div>
                    
                    {bookingData.extras.map(extraId => {
                      const extra = extras.find(e => e.id === extraId);
                      return extra && (
                        <div key={extraId} className="flex justify-between text-sm">
                          <span className="text-gray-600">{extra.title}</span>
                          <span className="font-medium">+{formatPrice(extra.price)}</span>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ضريبة القيمة المضافة (15%)</span>
                      <span className="font-medium">
                        +{formatPrice((selectedService.basePrice + bookingData.extras.reduce((sum, extraId) => {
                          const extra = extras.find(e => e.id === extraId);
                          return sum + (extra ? extra.price : 0);
                        }, 0)) * 0.15)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">الإجمالي</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">ضمان الخدمة</span>
                  </div>
                  <p className="text-xs text-green-700">
                    سيتم تنفيذ الخدمة في الوقت المحدد أو استرداد 50% من المبلغ
                  </p>
                </div>

                {selectedService.type === 'on-site' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">خدمة في الموقع</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      سيأتي المختص إلى موقعك لتنفيذ الخدمة
                    </p>
                  </div>
                )}

                {selectedService.type === 'pickup-delivery' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Truck className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">استلام وتوصيل</span>
                    </div>
                    <p className="text-xs text-purple-700">
                      سيتم استلام العناصر من موقعك وإعادتها بعد الانتهاء
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingPage;