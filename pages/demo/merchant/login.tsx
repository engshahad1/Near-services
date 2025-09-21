import { useState } from "react";

export default function MerchantLogin() {
  const [ownerName, setOwnerName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    const p = phone.trim();
    const prov = providerName.trim();

    if (!p || !prov) {
      setErr("phone & providerName required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: ownerName.trim() || "مالك المحل",
          providerName: prov,
          phone: p,
        }),
      });

      // نتعامل مع أي رد (JSON أو نص) ونظهر رسالة واضحة
      const isJSON = res.headers.get("content-type")?.includes("application/json");
      const payload = isJSON ? await res.json() : { ok: false, error: await res.text() };

      if (!res.ok || !payload?.ok) {
        setErr(payload?.error || `HTTP ${res.status}`);
        return;
      }

      // تخزين بيانات بسيطة (ديمو)
      localStorage.setItem("merchant_provider_id", payload.data.providerId);
      localStorage.setItem("merchant_provider_name", payload.data.providerName);

      // الذهاب للوحة التاجر
      window.location.href = "/demo/merchant";
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1e3d] p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-[#0f2a56] rounded-2xl shadow-xl p-6 text-white"
      >
        <h1 className="text-center text-2xl font-extrabold mb-4">
          تسجيل دخول المحل (Demo)
        </h1>

        {err ? (
          <div className="bg-red-600/90 text-white rounded-md px-3 py-2 text-sm mb-4">
            {err}
          </div>
        ) : null}

        <label className="block mb-2">اسم المالك:</label>
        <input
          className="w-full mb-4 rounded-lg bg-white/10 px-3 py-2 outline-none"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="مثال: Fahad Alanazi"
        />

        <label className="block mb-2">اسم المحل:</label>
        <input
          className="w-full mb-4 rounded-lg bg-white/10 px-3 py-2 outline-none"
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          placeholder="مثال: Star Sisi"
        />

        <label className="block mb-2">جوال:</label>
        <input
          className="w-full mb-6 rounded-lg bg-white/10 px-3 py-2 outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05xxxxxxxx"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2563eb] hover:bg-[#1e4ed8] disabled:opacity-60 rounded-lg py-2 font-semibold"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
