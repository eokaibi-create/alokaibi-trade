"use client";

import { useState, useEffect } from "react";

type Tab = "site" | "hero" | "about" | "contact" | "seo" | "password";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("site");
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (keys: string[]) => {
    setSaving(true);
    setMsg("");
    const body: Record<string, string> = {};
    for (const k of keys) {
      if (form[k] !== undefined) body[k] = form[k];
    }
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMsg("✅ 保存成功！已实时生效。");
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("❌ 保存失败");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-400 p-8">加载中...</div>;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "site", label: "网站信息", icon: "🌐" },
    { key: "hero", label: "首页 Hero", icon: "🖼️" },
    { key: "about", label: "关于我们", icon: "📖" },
    { key: "contact", label: "联系方式", icon: "📞" },
    { key: "seo", label: "SEO / 分析", icon: "🔍" },
    { key: "password", label: "修改密码", icon: "🔑" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">全站控制中心</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl shadow-sm p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setMsg(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* ─── Tab: Site Identity ─── */}
        {tab === "site" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">🌐 网站基本信息</h2>
            <Field label="网站名称 (site_name)" value={form.site_name || ""} onChange={(v) => setForm({ ...form, site_name: v })} />
            <Field label="标语 (site_tagline)" value={form.site_tagline || ""} onChange={(v) => setForm({ ...form, site_tagline: v })} />
            <Field label="Logo URL (site_logo)" value={form.site_logo || ""} onChange={(v) => setForm({ ...form, site_logo: v })} placeholder="留空使用文字Logo" />
            <Field label="Favicon URL (site_favicon)" value={form.site_favicon || ""} onChange={(v) => setForm({ ...form, site_favicon: v })} placeholder="留空使用默认" />
            <Field label="网站描述 (site_description)" value={form.site_description || ""} onChange={(v) => setForm({ ...form, site_description: v })} textarea />
            <Field label="关键词 (site_keywords)" value={form.site_keywords || ""} onChange={(v) => setForm({ ...form, site_keywords: v })} placeholder="逗号分隔" />
            <div className="pt-4">
              <SaveButton onClick={() => save(["site_name","site_tagline","site_logo","site_favicon","site_description","site_keywords"])} saving={saving} />
            </div>
          </div>
        )}

        {/* ─── Tab: Hero ─── */}
        {tab === "hero" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">🖼️ 首页 Hero 区域</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="英文标题 (hero_title_en)" value={form.hero_title_en || ""} onChange={(v) => setForm({ ...form, hero_title_en: v })} textarea />
              <Field label="中文标题 (hero_title_zh)" value={form.hero_title_zh || ""} onChange={(v) => setForm({ ...form, hero_title_zh: v })} textarea />
              <Field label="英文副标题 (hero_subtitle_en)" value={form.hero_subtitle_en || ""} onChange={(v) => setForm({ ...form, hero_subtitle_en: v })} textarea />
              <Field label="中文副标题 (hero_subtitle_zh)" value={form.hero_subtitle_zh || ""} onChange={(v) => setForm({ ...form, hero_subtitle_zh: v })} textarea />
              <Field label="英文 CTA (hero_cta_en)" value={form.hero_cta_en || ""} onChange={(v) => setForm({ ...form, hero_cta_en: v })} />
              <Field label="中文 CTA (hero_cta_zh)" value={form.hero_cta_zh || ""} onChange={(v) => setForm({ ...form, hero_cta_zh: v })} />
            </div>
            <div className="pt-4">
              <SaveButton onClick={() => save(["hero_title_en","hero_title_zh","hero_subtitle_en","hero_subtitle_zh","hero_cta_en","hero_cta_zh"])} saving={saving} />
            </div>
          </div>
        )}

        {/* ─── Tab: About ─── */}
        {tab === "about" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">📖 关于我们页面</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="英文标题 (about_title_en)" value={form.about_title_en || ""} onChange={(v) => setForm({ ...form, about_title_en: v })} />
              <Field label="中文标题 (about_title_zh)" value={form.about_title_zh || ""} onChange={(v) => setForm({ ...form, about_title_zh: v })} />
              <div className="md:col-span-2">
                <Field label="英文介绍 (about_intro_en)" value={form.about_intro_en || ""} onChange={(v) => setForm({ ...form, about_intro_en: v })} textarea />
              </div>
              <div className="md:col-span-2">
                <Field label="中文介绍 (about_intro_zh)" value={form.about_intro_zh || ""} onChange={(v) => setForm({ ...form, about_intro_zh: v })} textarea />
              </div>
              <Field label="英文使命标题 (about_mission_title_en)" value={form.about_mission_title_en || ""} onChange={(v) => setForm({ ...form, about_mission_title_en: v })} />
              <Field label="中文使命标题 (about_mission_title_zh)" value={form.about_mission_title_zh || ""} onChange={(v) => setForm({ ...form, about_mission_title_zh: v })} />
              <div className="md:col-span-2">
                <Field label="英文使命描述 (about_mission_desc_en)" value={form.about_mission_desc_en || ""} onChange={(v) => setForm({ ...form, about_mission_desc_en: v })} textarea />
              </div>
              <div className="md:col-span-2">
                <Field label="中文使命描述 (about_mission_desc_zh)" value={form.about_mission_desc_zh || ""} onChange={(v) => setForm({ ...form, about_mission_desc_zh: v })} textarea />
              </div>
            </div>
            <div className="pt-4">
              <SaveButton onClick={() => save([
                "about_title_en","about_title_zh","about_intro_en","about_intro_zh",
                "about_mission_title_en","about_mission_title_zh",
                "about_mission_desc_en","about_mission_desc_zh"
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ─── Tab: Contact ─── */}
        {tab === "contact" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">📞 联系方式</h2>
            <Field label="邮箱 (contact_email)" value={form.contact_email || ""} onChange={(v) => setForm({ ...form, contact_email: v })} />
            <Field label="电话 (contact_phone)" value={form.contact_phone || ""} onChange={(v) => setForm({ ...form, contact_phone: v })} />
            <Field label="WhatsApp (whatsapp_number)" value={form.whatsapp_number || ""} onChange={(v) => setForm({ ...form, whatsapp_number: v })} />
            <Field label="英文地址 (contact_address_en)" value={form.contact_address_en || ""} onChange={(v) => setForm({ ...form, contact_address_en: v })} textarea />
            <Field label="中文地址 (contact_address_zh)" value={form.contact_address_zh || ""} onChange={(v) => setForm({ ...form, contact_address_zh: v })} textarea />
            <Field label="英文 Footer 标语 (footer_tagline_en)" value={form.footer_tagline_en || ""} onChange={(v) => setForm({ ...form, footer_tagline_en: v })} textarea />
            <Field label="中文 Footer 标语 (footer_tagline_zh)" value={form.footer_tagline_zh || ""} onChange={(v) => setForm({ ...form, footer_tagline_zh: v })} textarea />
            <Field label="版权信息 (footer_copyright)" value={form.footer_copyright || ""} onChange={(v) => setForm({ ...form, footer_copyright: v })} />
            <div className="pt-4">
              <SaveButton onClick={() => save([
                "contact_email","contact_phone","whatsapp_number",
                "contact_address_en","contact_address_zh",
                "footer_tagline_en","footer_tagline_zh","footer_copyright"
              ])} saving={saving} />
            </div>
          </div>
        )}

        {/* ─── Tab: SEO ─── */}
        {tab === "seo" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">🔍 SEO & 分析工具</h2>
            <Field label="Google Analytics ID (google_analytics_id)" value={form.google_analytics_id || ""} onChange={(v) => setForm({ ...form, google_analytics_id: v })} placeholder="G-XXXXXXXXXX" />
            <Field label="Google Tag Manager (google_tag_manager)" value={form.google_tag_manager || ""} onChange={(v) => setForm({ ...form, google_tag_manager: v })} placeholder="GTM-XXXXXXX" />
            <div className="pt-4">
              <SaveButton onClick={() => save(["google_analytics_id","google_tag_manager"])} saving={saving} />
            </div>
          </div>
        )}

        {/* ─── Tab: Password ─── */}
        {tab === "password" && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold mb-4">🔑 修改管理员密码</h2>
            <PasswordField label="新密码" value={form._new_password || ""} onChange={(v) => setForm({ ...form, _new_password: v })} />
            <PasswordField label="确认密码" value={form._confirm_password || ""} onChange={(v) => setForm({ ...form, _confirm_password: v })} />
            {form._new_password && form._confirm_password && form._new_password !== form._confirm_password && (
              <p className="text-red-500 text-sm">两次密码不一致</p>
            )}
            <div className="pt-2">
              <SaveButton
                onClick={async () => {
                  if (form._new_password !== form._confirm_password) {
                    setMsg("❌ 两次密码不一致");
                    return;
                  }
                  if (!form._new_password || form._new_password.length < 6) {
                    setMsg("❌ 密码至少6位");
                    return;
                  }
                  setSaving(true);
                  setMsg("");
                  const res = await fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ new_password: form._new_password }),
                  });
                  if (res.ok) {
                    setMsg("✅ 密码修改成功！");
                    setForm({ ...form, _new_password: "", _confirm_password: "" });
                  } else {
                    setMsg("❌ 修改失败");
                  }
                  setSaving(false);
                }}
                saving={saving}
                label="修改密码"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder={placeholder} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={placeholder} />
      )}
    </div>
  );
}

function PasswordField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm" />
    </div>
  );
}

function SaveButton({ onClick, saving, label = "保存设置" }: {
  onClick: () => void; saving: boolean; label?: string;
}) {
  return (
    <button onClick={onClick} disabled={saving}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
      {saving ? "保存中..." : label}
    </button>
  );
}
