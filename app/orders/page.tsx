'use client';
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  User,
  Car,
  Shirt,
  Key,
  Smartphone,
  Wrench,
  Droplets,
  Wind,
  Zap
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  service: {
    id: string;
    title: string;
    icon: any;
    type: 'on-site' | 'pickup-delivery';
  };
  status: 'pending' | 'confirmed' | 'assigned' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  address: string;
  total: number;
  provider?: {
    name: string;
    rating: number;
    phone: string;
    avatar: string;
  };
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const serviceIcons = {
    car_wash: Car,
    laundry: Shirt,
    key_copy: Key,
    phone_repair: Smartphone,
    plumbing: Droplets,
    electrical: Zap,
    ac_repair: Wind,
    general_maintenance: Wrench
  };

  const statusConfig = {
    pending: { 
      label: 'في الانتظار', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    },
    confirmed: { 
      label: 'تم التأكيد', 
      color: 'bg-blue-100 text-blue-800', 
      icon: CheckCircle 
    },
    assigned: { 
      label: 'تم التعيين', 
      color: 'bg-purple-100 text-purple-800', 
      icon: User 
    },
    on_way: { 
      label: 'في الطريق', 
      color: 'bg-indigo-100 text-indigo-800', 
      icon: Truck 
    },
    arrived: { 
      label: 'وصل الموقع', 
      color: 'bg-orange-100 text-orange-800', 
      icon: MapPin 
    },
    in_progress: { 
      label: 'جاري التنفيذ', 
      color: 'bg-cyan-100 text-cyan-800', 
      icon: RefreshCw 
    },
    completed: { 
      label: 'مكتمل', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle 
    },
    cancelled: { 
      label: 'ملغي', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle 
    }
  };

  // بيانات تجريبية للطلبات
  const sampleOrders: Order[] = [
    {
      id: '1',
      orderNumber: '#SS001234',
      service: {
        id: 'car_wash',
        title: 'غسيل السيارات',
        icon: Car,
        type: 'on-site'
      },
      status: 'in_progress',
      date: '2025-08-29',
      time: '14:30',
      address: 'شارع الملك فهد، حي النخيل، الرياض',
      total: 87.5,
      provider: {
        name: 'أحمد محمد',
        rating: 4.9,
        phone: '+966501234567',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzQjgyRjYiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QU08L3RleHQ+Cjwvc3ZnPg=='
      },
      createdAt: '2025-08-28T10:30:00Z'
    },
    {
      id: '2',
      orderNumber: '#SS001235',
      service: {
        id: 'laundry',
        title: 'مغسلة الملابس',
        icon: Shirt,
        type: 'pickup-delivery'
      },
      status: 'completed',
      date: '2025-08-28',
      time: '16:00',
      address: 'حي الياسمين، الرياض',
      total: 45.0,
      provider: {
        name: 'سارة أحمد',
        rating: 4.8,
        phone: '+966502345678',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM4QjVDRjYiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0E8L3RleHQ+Cjwvc3ZnPg=='
      },
      createdAt: '2025-08-27T09:15:00Z'
    },
    {
      id: '3',
      orderNumber: '#SS001236',
      service: {
        id: 'plumbing',
        title: 'سباكة',
        icon: Droplets,
        type: 'on-site'
      },
      status: 'confirmed',
      date: '2025-08-30',
      time: '10:00',
      address: 'حي الربوة، الرياض',
      total: 115.0,
      createdAt: '2025-08-28T14:20:00Z'
    },
    {
      id: '4',
      orderNumber: '#SS001237',
      service: {
        id: 'phone_repair',
        title: 'صيانة الجوالات',
        icon: Smartphone,
        type: 'pickup-delivery'
      },
      status: 'on_way',
      date: '2025-08-29',
      time: '11:30',
      address: 'حي الملقا، الرياض',
      total: 92.0,
      provider: {
        name: 'محمد العلي',
        rating: 4.7,
        phone: '+966503456789',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUE8L3RleHQ+Cjwvc3ZnPg=='
      },
      createdAt: '2025-08-28T16:45:00Z'
    },
    {
      id: '5',
      orderNumber: '#SS001238',
      service: {
        id: 'ac_repair',
        title: 'صيانة التكييف',
        icon: Wind,
        type: 'on-site'
      },
      status: 'cancelled',
      date: '2025-08-27',
      time: '15:00',
      address: 'حي الدرعية، الرياض',
      total: 172.5,
      createdAt: '2025-08-26T12:00:00Z'
    }
  ];

  useEffect(() => {
    // محاكاة تحميل البيانات
    const loadOrders = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOrders(sampleOrders);
      setFilteredOrders(sampleOrders);
      setIsLoading(false);
    };

    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // تطبيق فلتر الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // تطبيق فلتر البحث
    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.service.title.includes(searchQuery) ||
        order.address.includes(searchQuery)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price.toFixed(0) + ' ريال';
  };

  const handleViewOrder = (orderId: string) => {
    window.location.href = `/tracking?order=${orderId}`;
  };

  const handleCallProvider = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
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
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">طلباتي</h1>
                <p className="text-sm text-gray-500">إدارة ومتابعة طلباتك</p>
              </div>
            </div>
            <a 
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              الرئيسية
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث برقم الطلب، الخدمة أو العنوان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="confirmed">تم التأكيد</option>
                <option value="assigned">تم التعيين</option>
                <option value="on_way">في الطريق</option>
                <option value="arrived">وصل الموقع</option>
                <option value="in_progress">جاري التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => ['pending', 'confirmed', 'assigned', 'on_way', 'arrived', 'in_progress'].includes(o.status)).length}
              </div>
              <div className="text-sm text-gray-600">طلبات نشطة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">طلبات مكتملة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">طلبات ملغاة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {orders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي المبلغ (ريال)</div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'لم يتم العثور على طلبات تطابق البحث' 
                : 'لم تقم بطلب أي خدمة حتى الآن'
              }
            </p>
            <a
              href="/"
              className="btn-gradient px-6 py-3 rounded-lg inline-flex items-center space-x-2"
            >
              <span>استكشف الخدمات</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const ServiceIcon = order.service.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Service Info */}
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                          <ServiceIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{order.service.title}</h3>
                          <p className="text-sm text-gray-600">{order.orderNumber}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(order.status)}
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600">
                              {order.service.type === 'on-site' ? 'خدمة في الموقع' : 'استلام وتوصيل'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">التاريخ:</span>
                            <span className="font-medium">{order.date} في {order.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">العنوان:</span>
                            <span className="font-medium truncate">{order.address}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">المبلغ:</span>
                            <span className="font-bold text-lg text-green-600">{formatPrice(order.total)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">تاريخ الطلب:</span>
                            <span className="font-medium">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Info & Actions */}
                      <div className="flex flex-col justify-between">
                        {order.provider && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <img
                                src={order.provider.avatar}
                                alt={order.provider.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{order.provider.name}</p>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600">{order.provider.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCallProvider(order.provider!.phone)}
                                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1 hover:bg-blue-700 transition-colors"
                              >
                                <Phone className="h-3 w-3" />
                                <span>اتصال</span>
                              </button>
                              <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-1 hover:bg-blue-50 transition-colors">
                                <MessageCircle className="h-3 w-3" />
                                <span>رسالة</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="flex-1 btn-gradient py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-1 hover:shadow-lg transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            <span>عرض التفاصيل</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Status Info */}
                    {order.status === 'in_progress' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                            <span className="text-sm font-medium text-blue-900">جاري تنفيذ الخدمة</span>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">
                            مقدم الخدمة يعمل على تنفيذ طلبك الآن. يمكنك متابعة التقدم من صفحة التتبع.
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-900">تم إنجاز الخدمة</span>
                            </div>
                            <button className="text-sm text-green-700 hover:text-green-800 underline">
                              تقييم الخدمة
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-900">تم إلغاء الطلب</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            تم إلغاء هذا الطلب. في حالة خصم أي مبلغ، سيتم استرداده خلال 3-5 أيام عمل.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State for Search */}
        {orders.length > 0 && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-gray-600 mb-4">
              جرب تعديل كلمات البحث أو تغيير الفلتر
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">هل تحتاج خدمة جديدة؟</h3>
              <p className="text-blue-100">
                اطلب خدمتك المفضلة الآن واستمتع بتجربة سهلة وسريعة
              </p>
            </div>
            <div className="flex space-x-3">
              <a
                href="/"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                تصفح الخدمات
              </a>
              <a
                href="/booking"
                className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                طلب سريع
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;