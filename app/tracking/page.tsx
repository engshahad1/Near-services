'use client';
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  User, 
  Phone, 
  MessageCircle,
  Star,
  Camera,
  Download,
  RefreshCw,
  AlertTriangle,
  Car,
  Truck,
  Navigation,
  Share2,
  FileText,
  Shield,
  ArrowLeft,
  X
} from 'lucide-react';

interface StatusStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  time?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  service: string;
  serviceIcon: any;
  type: 'on-site' | 'pickup-delivery';
  date: string;
  time: string;
  total: string;
  address: string;
  provider?: {
    name: string;
    rating: number;
    phone: string;
    photo: string;
    location?: {
      lat: number;
      lng: number;
      distance?: string;
      eta?: string;
    };
  };
  extras: string[];
  notes?: string;
}

interface LiveUpdate {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

const OrderTrackingPage = () => {
  const [currentStatus, setCurrentStatus] = useState('confirmed');
  const [estimatedTime, setEstimatedTime] = useState('45 دقيقة');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // بيانات الطلب
  const [orderData] = useState<OrderData>({
    id: '1',
    orderNumber: '#SS001234',
    service: 'غسيل السيارات',
    serviceIcon: Car,
    type: 'on-site',
    date: '2025-08-29',
    time: '14:30',
    total: '87.5 ريال',
    address: 'شارع الملك فهد، حي النخيل، الرياض 12345',
    provider: {
      name: 'أحمد محمد العلي',
      rating: 4.9,
      phone: '+966501234567',
      photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzQjgyRjYiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUE8L3RleHQ+Cjwvc3ZnPg==',
      location: {
        lat: 24.7136,
        lng: 46.6753,
        distance: '2.5 كم',
        eta: '12 دقيقة'
      }
    },
    extras: ['تنظيف داخلي', 'تلميع الإطارات'],
    notes: 'السيارة في الموقف السفلي - المكان رقم 15'
  });

  const statusSteps: StatusStep[] = [
    {
      id: 'confirmed',
      title: 'تم تأكيد الطلب',
      description: 'طلبك قيد المراجعة وسيتم تعيين مقدم خدمة قريباً',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      time: '14:32'
    },
    {
      id: 'assigned',
      title: 'تم تعيين مقدم الخدمة',
      description: 'تم العثور على مقدم خدمة مناسب وهو في طريقه إليك',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      time: '14:35'
    },
    {
      id: 'on_way',
      title: 'في الطريق',
      description: 'مقدم الخدمة في طريقه إلى موقعك',
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-500',
      time: '14:38'
    },
    {
      id: 'arrived',
      title: 'وصل الموقع',
      description: 'مقدم الخدمة وصل إلى موقعك وجاهز لبدء العمل',
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-500'
    },
    {
      id: 'in_progress',
      title: 'جاري تنفيذ الخدمة',
      description: 'جاري العمل على تنفيذ الخدمة المطلوبة',
      icon: RefreshCw,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'completed',
      title: 'تمت الخدمة',
      description: 'تم الانتهاء من الخدمة بنجاح',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500'
    }
  ];

  const liveUpdates: LiveUpdate[] = [
    { time: '14:32', message: 'تم تأكيد الطلب وجاري البحث عن مقدم خدمة', type: 'info' },
    { time: '14:35', message: 'تم العثور على أحمد محمد (تقييم 4.9) وتم تعيينه للطلب', type: 'success' },
    { time: '14:38', message: 'مقدم الخدمة في طريقه إليك - الوصول المتوقع خلال 15 دقيقة', type: 'info' },
    ...(currentStatus === 'arrived' ? [{ time: '14:50', message: 'وصل مقدم الخدمة إلى الموقع', type: 'success' as const }] : []),
    ...(currentStatus === 'in_progress' ? [{ time: '14:52', message: 'بدء تنفيذ الخدمة - غسيل خارجي', type: 'info' as const }] : []),
    ...(currentStatus === 'completed' ? [{ time: '15:45', message: 'تم الانتهاء من جميع الخدمات بنجاح', type: 'success' as const }] : [])
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.id === currentStatus);
  };

  const refreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < statusSteps.length - 1) {
        setCurrentStatus(statusSteps[currentIndex + 1].id);
        // تحديث الوقت المتوقع حسب الحالة
        const nextStatus = statusSteps[currentIndex + 1].id;
        switch (nextStatus) {
          case 'assigned':
            setEstimatedTime('30 دقيقة');
            break;
          case 'on_way':
            setEstimatedTime('15 دقيقة');
            break;
          case 'arrived':
            setEstimatedTime('5 دقائق');
            break;
          case 'in_progress':
            setEstimatedTime('45 دقيقة');
            break;
          case 'completed':
            setEstimatedTime('مكتمل');
            break;
        }
      }
    }, 2000);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');
    if (orderParam) {
      setSelectedOrderId(orderParam);
    }

    // محاكاة تحديث الحالة تلقائياً
    const interval = setInterval(() => {
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < statusSteps.length - 1 && Math.random() > 0.85) {
        const nextStatus = statusSteps[currentIndex + 1].id;
        setCurrentStatus(nextStatus);
      }
    }, 120000); // كل دقيقتين

    return () => clearInterval(interval);
  }, [currentStatus]);

  const currentStep = statusSteps.find(step => step.id === currentStatus);
  const ServiceIcon = orderData.serviceIcon;

  const handleCallProvider = () => {
    if (orderData.provider?.phone) {
      window.open(`tel:${orderData.provider.phone}`);
    }
  };

  const handleShareOrder = () => {
    setShowShareModal(true);
  };

  const handleDownloadInvoice = () => {
    // محاكاة تحميل الفاتورة
    alert('سيتم تحميل الفاتورة قريباً');
  };

  const getLocationUrl = () => {
    if (orderData.provider?.location) {
      return `https://maps.google.com/maps?q=${orderData.provider.location.lat},${orderData.provider.location.lng}`;
    }
    return '#';
  };

  if (!currentStep) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 space-x-reverse">
              <a href="/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">تتبع الطلب</h1>
                <p className="text-sm text-gray-500">{orderData.orderNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button 
                onClick={handleShareOrder}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                title="مشاركة الطلب"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button 
                onClick={refreshStatus}
                disabled={isRefreshing}
                className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">تحديث</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className={`${currentStep.bgColor} p-6 border-b-4 ${currentStep.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className={`${currentStep.bgColor} p-3 rounded-full border-2 ${currentStep.borderColor} shadow-lg`}>
                  <currentStep.icon className={`h-8 w-8 ${currentStep.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                  <p className="text-gray-600 mt-1">{currentStep.description}</p>
                  {currentStep.time && (
                    <p className="text-sm text-gray-500 mt-2">آخر تحديث: {currentStep.time}</p>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">الوقت المتوقع</p>
                <p className="text-xl font-bold text-gray-900">{estimatedTime}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <ServiceIcon className="h-6 w-6 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{orderData.service}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {orderData.type === 'on-site' ? 'خدمة في الموقع' : 'استلام وتوصيل'}
                    </p>
                    {orderData.extras.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">خدمات إضافية:</p>
                        <div className="flex flex-wrap gap-2">
                          {orderData.extras.map((extra, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {extra}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Clock className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{orderData.date}</p>
                    <p className="text-sm text-gray-600">{orderData.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">عنوان الخدمة</p>
                    <p className="text-sm text-gray-600">{orderData.address}</p>
                    {orderData.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">ملاحظة: {orderData.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{orderData.total}</p>
                  <button
                    onClick={handleDownloadInvoice}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 space-x-reverse"
                  >
                    <Download className="h-3 w-3" />
                    <span>تحميل الفاتورة</span>
                  </button>
                </div>

                {orderData.provider && currentStatus !== 'confirmed' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse mb-3">
                      <div className="relative">
                        <img 
                          src={orderData.provider.photo} 
                          alt={orderData.provider.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{orderData.provider.name}</p>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{orderData.provider.rating}</span>
                          <span className="text-xs text-gray-500">• مقدم خدمة معتمد</span>
                        </div>
                      </div>
                    </div>

                    {orderData.provider.location && currentStatus === 'on_way' && (
                      <div className="mb-3 p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">الموقع الحالي</span>
                          <a
                            href={getLocationUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Navigation className="h-4 w-4" />
                          </a>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">المسافة: {orderData.provider.location.distance}</span>
                          <span className="text-green-600 font-medium">ETA: {orderData.provider.location.eta}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        onClick={handleCallProvider}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1 space-x-reverse hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span>اتصال</span>
                      </button>
                      <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1 space-x-reverse hover:bg-blue-50 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>رسالة</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">مراحل تنفيذ الطلب</h3>
          
          <div className="relative">
            {statusSteps.map((step, index) => {
              const isActive = step.id === currentStatus;
              const isCompleted = getCurrentStepIndex() > index;
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
                  {/* Connection Line */}
                  {index < statusSteps.length - 1 && (
                    <div className={`absolute right-6 top-16 w-0.5 h-16 transition-colors duration-300 ${
                      isCompleted ? 'bg-green-400' : 'bg-gray-200'
                    }`}></div>
                  )}
                  
                  {/* Step Circle */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? `${step.bgColor} ${step.borderColor}` 
                      : isCompleted 
                        ? 'bg-green-100 border-green-500' 
                        : 'bg-gray-100 border-gray-300'
                  }`}>
                    <StepIcon className={`w-6 h-6 ${
                      isActive 
                        ? step.color 
                        : isCompleted 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Step Content */}
                  <div className="mr-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${
                        isActive ? 'text-gray-900' : isCompleted ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </h4>
                      {step.time && (isActive || isCompleted) && (
                        <span className="text-sm text-gray-500">{step.time}</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      isActive ? 'text-gray-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Updates */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">التحديثات المباشرة</h3>
            <div className="flex items-center space-x-2 space-x-reverse text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">مباشر</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {liveUpdates.map((update, index) => (
              <div key={index} className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  update.type === 'success' 
                    ? 'bg-green-500' 
                    : update.type === 'warning' 
                      ? 'bg-yellow-500' 
                      : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{update.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Actions */}
        {currentStatus !== 'completed' && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">حاجة مساعدة؟</h3>
            </div>
            <div className="flex space-x-4 space-x-reverse">
              <button 
                onClick={() => alert('سيتم إلغاء الطلب بعد التأكيد')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                إلغاء الطلب
              </button>
              <button 
                onClick={() => alert('سيتم توصيلك بفريق الدعم')}
                className="border border-red-600 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                تواصل مع الدعم
              </button>
            </div>
          </div>
        )}

        {/* Rating Section - Only show when completed */}
        {currentStatus === 'completed' && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تمت الخدمة بنجاح! 🎉</h3>
              <p className="text-gray-600">نأمل أن تكون راضياً عن الخدمة المقدمة</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">قيم تجربتك</h4>
              <div className="flex justify-center items-center space-x-2 space-x-reverse mb-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="text-gray-300 hover:text-yellow-400 transition-colors transform hover:scale-110"
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
              
              <textarea 
                placeholder="اكتب تقييمك وملاحظاتك هنا (اختياري)"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium mt-4 hover:from-blue-700 hover:to-purple-700 transition-all">
                إرسال التقييم
              </button>
            </div>
            
            <div className="flex space-x-3 space-x-reverse">
              <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
                <Camera className="h-4 w-4" />
                <span>إضافة صور</span>
              </button>
              <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                طلب خدمة أخرى
              </button>
            </div>
          </div>
        )}

        {/* Order Summary for Completed Orders */}
        {currentStatus === 'completed' && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">ملخص الطلب النهائي</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">رقم الطلب:</span>
                  <span className="font-semibold text-gray-900">{orderData.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">الخدمة:</span>
                  <span className="font-semibold text-gray-900">{orderData.service}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">مقدم الخدمة:</span>
                  <span className="font-semibold text-gray-900">{orderData.provider?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">وقت البدء:</span>
                  <span className="font-semibold text-gray-900">14:52</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">وقت الانتهاء:</span>
                  <span className="font-semibold text-gray-900">15:45</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">المدة الإجمالية:</span>
                  <span className="font-semibold text-gray-900">53 دقيقة</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <span className="font-semibold text-gray-900">بطاقة ائتمان</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">حالة الدفع:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 ml-1" />
                    مدفوع
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b-2 border-gray-300">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="font-bold text-xl text-gray-900">{orderData.total}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    سيتم إرسال الفاتورة التفصيلية على البريد الإلكتروني المسجل
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">مشاركة الطلب</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              شارك رابط تتبع الطلب مع الآخرين لمتابعة حالة الطلب
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <code className="text-xs text-gray-700 break-all">
                https://sooqservice.com/track/{orderData.orderNumber}
              </code>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://sooqservice.com/track/${orderData.orderNumber}`);
                  alert('تم نسخ الرابط!');
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                نسخ الرابط
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'تتبع الطلب',
                      text: `تتبع طلب ${orderData.service} - ${orderData.orderNumber}`,
                      url: `https://sooqservice.com/track/${orderData.orderNumber}`
                    });
                  } else {
                    alert('المشاركة غير متاحة في هذا المتصفح');
                  }
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                مشاركة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1">
          <div className="flex space-x-2 space-x-reverse">
            {orderData.provider && currentStatus !== 'completed' && (
              <button
                onClick={handleCallProvider}
                className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
                title="اتصال سريع"
              >
                <Phone className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={refreshStatus}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
              title="تحديث سريع"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="grid grid-cols-4 gap-1">
          <button className="flex flex-col items-center py-3 px-2 text-blue-600">
            <Package className="h-5 w-5 mb-1" />
            <span className="text-xs">الطلبات</span>
          </button>
          <button 
            onClick={handleCallProvider}
            className="flex flex-col items-center py-3 px-2 text-gray-600 disabled:opacity-50"
            disabled={!orderData.provider}
          >
            <Phone className="h-5 w-5 mb-1" />
            <span className="text-xs">اتصال</span>
          </button>
          <button 
            onClick={handleShareOrder}
            className="flex flex-col items-center py-3 px-2 text-gray-600"
          >
            <Share2 className="h-5 w-5 mb-1" />
            <span className="text-xs">مشاركة</span>
          </button>
          <button 
            onClick={() => window.open('https://wa.me/+966501234567', '_blank')}
            className="flex flex-col items-center py-3 px-2 text-gray-600"
          >
            <MessageCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">واتساب</span>
          </button>
        </div>
      </div>

      {/* Overlay for demo purposes */}
      <div className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm z-50 shadow-lg">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>تجربة تفاعلية - اضغط "تحديث" لرؤية التقدم</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;