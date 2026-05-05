"use client";

import { use, useState } from "react";

const categoryKeys = ["electronics", "autoparts", "furniture", "textiles", "vaporx"];

export default function InquiryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", category: "", product: "", quantity: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const isZh = locale === "zh";

  const t = {
    title: isZh ? "提交询盘" : "Submit Inquiry",
    desc: isZh ? "对我们的产品感兴趣？填写以下表单，我们将在24小时内联系您。" :
          "Interested in our products? Fill out the form and we'll respond within 24 hours.",
    name: isZh ? "姓名" : "Full Name",
    email: isZh ? "邮箱" : "Email",
    phone: isZh ? "电话" : "Phone",
    company: isZh ? "公司" : "Company",
    category: isZh ? "产品分类" : "Product Category",
    product: isZh ? "产品名称（选填）" : "Product Name (Optional)",
    quantity: isZh ? "预估数量（选填）" : "Estimated Quantity (Optional)",
    message: isZh ? "询盘详情" : "Inquiry Details",
    placeholder: isZh ? "请描述您感兴趣的产品..." : "Please describe what products you're interested in...",
    submit: isZh ? "提交询盘" : "Submit Inquiry",
    success: isZh ? "✅ 提交成功！我们将在24小时内联系您。" : "✅ Submitted successfully! We'll contact you within 24 hours.",
    error: isZh ? "提交失败，请重试" : "Failed to submit. Please try again.",
    cats: {
      electronics: isZh ? "消费电子" : "Consumer Electronics",
      autoparts: isZh ? "汽车配件" : "Auto Parts",
      furniture: isZh ? "家具建材" : "Furniture & Building",
      textiles: isZh ? "纺织品" : "Textiles & Apparel",
      vaporx: isZh ? "VAPORX 水烟与电子烟" : "VAPORX — Hookah & Vaping",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", company: "", category: "", product: "", quantity: "", message: "" });
      } else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-gray-500 mb-8">{t.desc}</p>

      {status === "success" ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-xl text-center">
          <p className="text-lg font-semibold">{t.success}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label={t.email} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Input label={t.phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Input label={t.company} value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t.category}</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">{isZh ? "请选择..." : "Select a category..."}</option>
              {categoryKeys.map((key) => (
                <option key={key} value={key}>{(t.cats as any)[key]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t.product} value={form.product} onChange={(v) => setForm({ ...form, product: v })} />
            <Input label={t.quantity} value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t.message}</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} required placeholder={t.placeholder} />
          </div>

          {status === "error" && <p className="text-red-500 text-sm">{t.error}</p>}

          <button type="submit" disabled={status === "loading"}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition">
            {status === "loading" ? (isZh ? "提交中..." : "Submitting...") : t.submit}
          </button>
        </form>
      )}
    </div>
  );
}

function Input({ label, type = "text", value, onChange, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="text-sm text-gray-500 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required={required} />
    </div>
  );
}
