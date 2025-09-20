import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  price: number;
  createdAt: string;
};

export default function MerchantServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "" });

  // جلب الخدمات
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/services");
      const data = await res.json();
      if (data.ok) setServices(data.data);
    } catch (err) {
      console.error("Fetch services error", err);
    } finally {
      setLoading(false);
    }
  };

  // إضافة خدمة جديدة
  const addService = async () => {
    if (!newService.name || !newService.price) return alert("أدخل كل البيانات");
    try {
      await fetch("/api/merchant/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newService.name,
          price: parseFloat(newService.price),
        }),
      });
      setNewService({ name: "", price: "" });
      fetchServices();
    } catch (err) {
      console.error("Add service error", err);
    }
  };

  // حذف خدمة
  const deleteService = async (id: string) => {
    try {
      await fetch(`/api/merchant/services?id=${id}`, { method: "DELETE" });
      fetchServices();
    } catch (err) {
      console.error("Delete service error", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* الهيدر */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
        <a
          href="/demo/merchant"
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          الرجوع للطلبات
        </a>
      </div>

      {/* إضافة خدمة جديدة */}
      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">إضافة خدمة جديدة</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="اسم الخدمة"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            className="p-2 rounded bg-gray-700 flex-1"
          />
          <input
            type="number"
            placeholder="السعر (SAR)"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
            className="p-2 rounded bg-gray-700 w-32"
          />
          <button
            onClick={addService}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + إضافة
          </button>
        </div>
      </div>

      {/* قائمة الخدمات */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">خدماتي</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : services.length === 0 ? (
          <p>لا توجد خدمات مضافة.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 text-right">#</th>
                <th className="p-2 text-right">اسم الخدمة</th>
                <th className="p-2 text-right">السعر</th>
                <th className="p-2 text-right">تاريخ الإضافة</th>
                <th className="p-2 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc, idx) => (
                <tr key={svc.id} className="border-b border-gray-600 hover:bg-gray-700">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{svc.name}</td>
                  <td className="p-2">{svc.price} SAR</td>
                  <td className="p-2">
                    {new Date(svc.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteService(svc.id)}
                      className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                    >
                      حذف
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
