"use client";

import { use, useState } from "react";

export default function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const isZh = locale === "zh";

  const tForm = {
    title: isZh ? "联系我们" : "Contact Us",
    desc: isZh ? "有问题或想讨论商机？我们期待您的来信。" : "Have a question? We'd love to hear from you.",
    name: isZh ? "姓名" : "Your Name",
    email: isZh ? "邮箱" : "Email",
    phone: isZh ? "电话" : "Phone",
    company: isZh ? "公司" : "Company",
    subject: isZh ? "主题" : "Subject",
    message: isZh ? "留言" : "Message",
    submit: isZh ? "发送留言" : "Send Message",
    success: isZh ? "发送成功！" : "Message sent!",
    error: isZh ? "发送失败" : "Failed to send",
  };

  const tSubjects: Record<string, string> = {
    general: isZh ? "一般咨询" : "General Inquiry",
    partnership: isZh ? "合作机会" : "Partnership",
    sourcing: isZh ? "产品采购" : "Sourcing",
    complaint: isZh ? "投诉反馈" : "Complaint",
  };

  const contactInfo = {
    email: "info@okaibiglobal.com",
    phone: "+86-571-8888-8888",
    address: isZh ? "中国浙江省杭州市" : "Hangzhou, Zhejiang, China",
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{tForm.title}</h1>
      <p className="text-gray-500 mb-8">{tForm.desc}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center"><p className="text-lg font-semibold">{tForm.success}</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={tForm.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Input label={tForm.email} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Input label={tForm.phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label={tForm.company} value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{tForm.subject}</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                  <option value="">{isZh ? "请选择..." : "Select..."}</option>
                  {Object.entries(tSubjects).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{tForm.message}</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} required />
              </div>
              {status === "error" && <p className="text-red-500 text-sm">{tForm.error}</p>}
              <button type="submit" disabled={status === "loading"} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                {status === "loading" ? "..." : tForm.submit}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{isZh ? "联系信息" : "Contact Info"}</h3>
          <div className="space-y-4 text-sm">
            <div><span className="text-gray-400">Email:</span><br /><a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">{contactInfo.email}</a></div>
            <div><span className="text-gray-400">Phone:</span><br />{contactInfo.phone}</div>
            <div><span className="text-gray-400">{isZh ? "地址" : "Address"}:</span><br />{contactInfo.address}</div>
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" required={required} />
    </div>
  );
}
