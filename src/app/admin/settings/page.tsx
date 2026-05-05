"use client";

import { useState, useEffect } from "react";

type Tab = "site" | "hero" | "about" | "contact" | "seo" | "cloud" | "email" | "password";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("site");
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async (keys: string[]) => {
    setSaving(true); setMsg("");
    const body: Record<string, string> = {};
    for (const k of keys) if (form[k] !== undefined) body[k] = form[k];
    const res = await fetch("/api/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setMsg(res.ok ? "✅ 保存成功！已实时生效。" : "❌ 保存失败");
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading) return <div className="text-gray-400 p-8">加载中...</div>;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "site", label: "网站信息", icon: "🌐" },
    { key: "hero", label: "首页 Hero", icon: "🖼️" },
    { key: "about", label: "关于我们", icon: "📖" },
    { key: "contact", label: "联系方式", icon: "📞" },
    { key: "seo", label: "SEO / 分析", icon: "🔍" },
    { key: "cloud", label: "☁️ 云存储", icon: "☁️" },
    { key: "email", label: "📧 邮件", icon: "📧" },
    { key: "password", label: "🔑 密码", icon: "🔑" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">⚙️ 全站控制中心</h1>

      <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl shadow-sm p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setMsg(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{msg}</div>}

      <div className="bg-white rounded-xl shadow-sm p-6">
        {tab === "site" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">🌐 网站信息</h2>
            <Field label="网站名称" value={form.site_name || ""} onChange={(v) => setForm({ ...form, site_name: v })} />
            <Field label="标语" value={form.site_tagline || ""} onChange={(v) => setForm({ ...form, site_tagline: v })} />
            <Field label="Logo URL" value={form.site_logo || ""} onChange={(v) => setForm({ ...form, site_logo: v })} placeholder="留空使用文字Logo" />
            <Field label="Favicon URL" value={form.site_favicon || ""} onChange={(v) => setForm({ ...form, site_favicon: v })} placeholder="留空使用默认" />
            <Field label="网站描述" value={form.site_description || ""} onChange={(v) => setForm({ ...form, site_description: v })} textarea />
            <Field label="关键词" value={form.site_keywords || ""} onChange={(v) => setForm({ ...form, site_keywords: v })} placeholder="逗号分隔" />
            <SaveButton onClick={() => save(["site_name","site_tagline","site_logo","site_favicon","site_description","site_keywords"])} saving={saving} />
          </div>
        )}

        {tab === "hero" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">🖼️ 首页 Hero 区域</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="英文标题" value={form.hero_title_en || ""} onChange={(v) => setForm({ ...form, hero_title_en: v })} textarea />
              <Field label="中文标题" value={form.hero_title_zh || ""} onChange={(v) => setForm({ ...form, hero_title_zh: v })} textarea />
              <Field label="英文副标题" value={form.hero_subtitle_en || ""} onChange={(v) => setForm({ ...form, hero_subtitle_en: v })} textarea />
              <Field label="中文副标题" value={form.hero_subtitle_zh || ""} onChange={(v) => setForm({ ...form, hero_subtitle_zh: v })} textarea />
              <Field label="英文 CTA" value={form.hero_cta_en || ""} onChange={(v) => setForm({ ...form, hero_cta_en: v })} />
              <Field label="中文 CTA" value={form.hero_cta_zh || ""} onChange={(v) => setForm({ ...form, hero_cta_zh: v })} />
            </div>
            <SaveButton onClick={() => save(["hero_title_en","hero_title_zh","hero_subtitle_en","hero_subtitle_zh","hero_cta_en","hero_cta_zh"])} saving={saving} />
          </div>
        )}

        {tab === "about" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">📖 关于我们</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="英文标题" value={form.about_title_en || ""} onChange={(v) => setForm({ ...form, about_title_en: v })} />
              <Field label="中文标题" value={form.about_title_zh || ""} onChange={(v) => setForm({ ...form, about_title_zh: v })} />
              <div className="md:col-span-2"><Field label="英文介绍" value={form.about_intro_en || ""} onChange={(v) => setForm({ ...form, about_intro_en: v })} textarea /></div>
              <div className="md:col-span-2"><Field label="中文介绍" value={form.about_intro_zh || ""} onChange={(v) => setForm({ ...form, about_intro_zh: v })} textarea /></div>
              <Field label="英文使命标题" value={form.about_mission_title_en || ""} onChange={(v) => setForm({ ...form, about_mission_title_en: v })} />
              <Field label="中文使命标题" value={form.about_mission_title_zh || ""} onChange={(v) => setForm({ ...form, about_mission_title_zh: v })} />
              <div className="md:col-span-2"><Field label="英文使命描述" value={form.about_mission_desc_en || ""} onChange={(v) => setForm({ ...form, about_mission_desc_en: v })} textarea /></div>
              <div className="md:col-span-2"><Field label="中文使命描述" value={form.about_mission_desc_zh || ""} onChange={(v) => setForm({ ...form, about_mission_desc_zh: v })} textarea /></div>
            </div>
            <SaveButton onClick={() => save(["about_title_en","about_title_zh","about_intro_en","about_intro_zh","about_mission_title_en","about_mission_title_zh","about_mission_desc_en","about_mission_desc_zh"])} saving={saving} />
          </div>
        )}

        {tab === "contact" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">📞 联系方式</h2>
            <Field label="邮箱" value={form.contact_email || ""} onChange={(v) => setForm({ ...form, contact_email: v })} />
            <Field label="电话" value={form.contact_phone || ""} onChange={(v) => setForm({ ...form, contact_phone: v })} />
            <Field label="WhatsApp 号码" value={form.whatsapp_number || ""} onChange={(v) => setForm({ ...form, whatsapp_number: v })} />
            <Field label="英文地址" value={form.contact_address_en || ""} onChange={(v) => setForm({ ...form, contact_address_en: v })} textarea />
            <Field label="中文地址" value={form.contact_address_zh || ""} onChange={(v) => setForm({ ...form, contact_address_zh: v })} textarea />
            <Field label="英文 Footer 标语" value={form.footer_tagline_en || ""} onChange={(v) => setForm({ ...form, footer_tagline_en: v })} textarea />
            <Field label="中文 Footer 标语" value={form.footer_tagline_zh || ""} onChange={(v) => setForm({ ...form, footer_tagline_zh: v })} textarea />
            <Field label="版权信息" value={form.footer_copyright || ""} onChange={(v) => setForm({ ...form, footer_copyright: v })} />
            <SaveButton onClick={() => save(["contact_email","contact_phone","whatsapp_number","contact_address_en","contact_address_zh","footer_tagline_en","footer_tagline_zh","footer_copyright"])} saving={saving} />
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">🔍 SEO & 分析工具</h2>
            <Field label="Google Analytics ID" value={form.google_analytics_id || ""} onChange={(v) => setForm({ ...form, google_analytics_id: v })} placeholder="G-XXXXXXXXXX" />
            <Field label="Google Tag Manager" value={form.google_tag_manager || ""} onChange={(v) => setForm({ ...form, google_tag_manager: v })} placeholder="GTM-XXXXXXX" />
            <SaveButton onClick={() => save(["google_analytics_id","google_tag_manager"])} saving={saving} />
          </div>
        )}

        {tab === "cloud" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">☁️ Cloudinary 云存储配置</h2>
            <p className="text-sm text-gray-400 mb-4">在 <a href="https://cloudinary.com/console" target="_blank" className="text-blue-500 hover:underline" rel="noopener noreferrer">Cloudinary Dashboard</a> 获取以下信息</p>
            <Field label="Cloud Name" value={form.cloudinary_cloud_name || ""} onChange={(v) => setForm({ ...form, cloudinary_cloud_name: v })} placeholder="your-cloud-name" />
            <Field label="API Key" value={form.cloudinary_api_key || ""} onChange={(v) => setForm({ ...form, cloudinary_api_key: v })} placeholder="123456789012345" />
            <Field label="Upload Preset" value={form.cloudinary_upload_preset || ""} onChange={(v) => setForm({ ...form, cloudinary_upload_preset: v })} placeholder="your_unsigned_preset" />
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
              <strong>💡 配置提示：</strong><br />
              1. 登录 Cloudinary → Settings → Upload<br />
              2. 创建 Upload Preset (类型选择 Unsigned)<br />
              3. 将 Cloud Name、API Key、Upload Preset 填入此处保存<br />
              4. 保存后在「产品管理」中即可上传图片
            </div>
            <SaveButton onClick={() => save(["cloudinary_cloud_name","cloudinary_api_key","cloudinary_upload_preset"])} saving={saving} label="保存云存储配置" />
          </div>
        )}

        {tab === "email" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">📧 邮件通知配置</h2>
            <p className="text-sm text-gray-400 mb-4">使用 Gmail 的 App Password 发送邮件通知。了解如何获取 <a href="https://support.google.com/accounts/answer/185833" target="_blank" className="text-blue-500 hover:underline" rel="noopener noreferrer">App Password</a></p>
            <Field label="SMTP 邮箱 (发件人)" value={form.smtp_user || ""} onChange={(v) => setForm({ ...form, smtp_user: v })} placeholder="eokaibi@gmail.com" />
            <Field label="SMTP 密码 / App Password" value={form.smtp_pass || ""} onChange={(v) => setForm({ ...form, smtp_pass: v })} placeholder="16位App密码" />
            <Field label="SMTP 主机" value={form.smtp_host || "smtp.gmail.com"} onChange={(v) => setForm({ ...form, smtp_host: v })} />
            <Field label="SMTP 端口" value={form.smtp_port || "587"} onChange={(v) => setForm({ ...form, smtp_port: v })} />
            <Field label="通知接收邮箱" value={form.notification_email || "eokaibi@gmail.com"} onChange={(v) => setForm({ ...form, notification_email: v })} placeholder="接收询盘通知的邮箱" />
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-700">
              <strong>✅ 配置后自动生效：</strong><br />
              • 📩 客户提交询盘 → 发通知到您邮箱<br />
              • 📬 客户提交联系表单 → 发通知到您邮箱<br />
              • 💬 回复客户询盘 → 自动发邮件给客户
            </div>
            <SaveButton onClick={() => save(["smtp_user","smtp_pass","smtp_host","smtp_port","notification_email"])} saving={saving} label="保存邮件配置" />
          </div>
        )}

        {tab === "password" && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold mb-4">🔑 修改管理员密码</h2>
            <PasswordField label="新密码" value={form._new_password || ""} onChange={(v) => setForm({ ...form, _new_password: v })} />
            <PasswordField label="确认密码" value={form._confirm_password || ""} onChange={(v) => setForm({ ...form, _confirm_password: v })} />
            {form._new_password && form._confirm_password && form._new_password !== form._confirm_password && <p className="text-red-500 text-sm">两次密码不一致</p>}
            <SaveButton onClick={async () => {
              if (form._new_password !== form._confirm_password) { setMsg("❌ 两次密码不一致"); return; }
              if (!form._new_password || form._new_password.length < 6) { setMsg("❌ 密码至少6位"); return; }
              setSaving(true); setMsg("");
              const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ new_password: form._new_password }) });
              setMsg(res.ok ? "✅ 密码修改成功！" : "❌ 修改失败");
              if (res.ok) setForm({ ...form, _new_password: "", _confirm_password: "" });
              setSaving(false);
            }} saving={saving} label="修改密码" />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder={placeholder} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={placeholder} />
      )}
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
    </div>
  );
}

function SaveButton({ onClick, saving, label = "保存设置" }: { onClick: () => void; saving: boolean; label?: string }) {
  return (
    <button onClick={onClick} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition">
      {saving ? "保存中..." : label}
    </button>
  );
}
