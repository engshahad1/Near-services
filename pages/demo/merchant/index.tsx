import { useEffect, useState } from "react";

type Order = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};

export default function MerchantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const providerName = "Demo Laundry Co"; // لاحقًا ناخذها من الـ login أو الـ DB

  // جلب الطلبات
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/orders");
      const data = await res.json();
      if (data.ok) setOrders(data.data);
    } catch (err) {
      console.error("Fetch orders error", err);
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الطلب (قبول / رفض)
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/merchant/orders?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders(); // نعيد تحميل القائمة بعد التحديث
    } catch (err) {
      console.error("Update order error", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* الهيدر */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          لوحة المحل (Demo) — {providerName}
        </h1>
        <div className="space-x-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            تحديث الصفحة
          </button>
          <a
            href="/demo/merchant/services"
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            إدارة الخدمات
          </a>
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">الطلبات</h2>
        {loading ? (
          <p>جاري تحميل الطلبات...</p>
        ) : orders.length === 0 ? (
          <p>لا يوجد طلبات حالياً.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 text-right">#</th>
                <th className="p-2 text-right">رقم الطلب</th>
                <th className="p-2 text-right">المبلغ</th>
                <th className="p-2 text-right">التاريخ</th>
                <th className="p-2 text-right">الحالة</th>
                <th className="p-2 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-600 hover:bg-gray-700"
                >
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{order.orderNumber}</td>
                  <td className="p-2">{order.totalAmount} SAR</td>
                  <td className="p-2">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        order.status === "PENDING"
                          ? "bg-yellow-600"
                          : order.status === "CONFIRMED"
                          ? "bg-green-600"
                          : order.status === "CANCELLED"
                          ? "bg-red-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                      className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                      className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                    >
                      رفض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
