"use client";

import { use, useState, useEffect } from "react";

export default function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const isZh = locale === "zh";

  useEffect(() => {
    fetch("/api/site-settings").then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const contactEmail = settings.contact_email || "info@okaibiglobal.com";
  const contactPhone = settings.contact_phone || "+86-571-8888-8888";
  const contactAddress = isZh && settings.contact_address_zh
    ? settings.contact_address_zh
    : (settings.contact_address_en || "Hangzhou, Zhejiang, China");
  const whatsappNumber = settings.whatsapp_number || "";

  const t = {
    title: isZh ? "联系我们" : "Contact Us",
    desc: isZh ? "有问题或想讨论商机？我们期待您的来信。" : "Have a question? We'd love to hear from you.",
    name: isZh ? "姓名" : "Your Name",
    email: isZh ? "邮箱" : "Email",
    phone: isZh ? "电话" : "Phone",
    company: isZh ? "公司" : "Company",
    subject: isZh ? "主题" : "Subject",
    message: isZh ? "留言" : "Message",
    submit: isZh ? "发送留言" : "Send Message",
    success: isZh ? "发送成功！我们会在24小时内回复。" : "Message sent! We'll respond within 24 hours.",
    error: isZh ? "发送失败，请重试。" : "Failed to send. Please try again.",
    info_title: isZh ? "联系信息" : "Contact Info",
  };

  const tSubjects: Record<string, string> = {
    general: isZh ? "一般咨询" : "General Inquiry",
    partnership: isZh ? "合作机会" : "Partnership Opportunity",
    sourcing: isZh ? "产品采购" : "Product Sourcing",
    complaint: isZh ? "投诉反馈" : "Complaint / Feedback",
  };

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", phone: "", company: "", subject: "", message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-gray-500 mb-8">{t.desc}</p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Form — 3 cols */}
        <div className="md:col-span-3">
          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-xl text-center">
              <div className="text-3xl mb-3">✅</div>
              <p className="text-lg font-semibold">{t.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={t.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Input label={t.email} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Input label={t.phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label={t.company} value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.subject}</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                  <option value="">{isZh ? "请选择..." : "Select..."}</option>
                  {Object.entries(tSubjects).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{t.message}</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} required />
              </div>
              {status === "error" && <p className="text-red-500 text-sm">{t.error}</p>}
              <button type="submit" disabled={status === "loading"}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition">
                {status === "loading" ? (isZh ? "发送中..." : "Sending...") : t.submit}
              </button>
            </form>
          )}
        </div>

        {/* Info Sidebar — 2 cols */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{t.info_title}</h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">✉️</span>
                <div>
                  <div className="text-gray-400 text-xs">{isZh ? "邮箱" : "Email"}</div>
                  <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline font-medium">{contactEmail}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">📞</span>
                <div>
                  <div className="text-gray-400 text-xs">{isZh ? "电话" : "Phone"}</div>
                  <div className="font-medium">{contactPhone}</div>
                </div>
              </div>
              {whatsappNumber && (
                <div className="flex items-start gap-3">
                  <span className="text-green-600 mt-0.5">💬</span>
                  <div>
                    <div className="text-gray-400 text-xs">WhatsApp</div>
                    <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`} target="_blank"
                      className="text-green-600 hover:underline font-medium">{whatsappNumber}</a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">📍</span>
                <div>
                  <div className="text-gray-400 text-xs">{isZh ? "地址" : "Address"}</div>
                  <div className="font-medium">{contactAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="text-sm text-gray-500 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required={required} />
    </div>
  );
}
