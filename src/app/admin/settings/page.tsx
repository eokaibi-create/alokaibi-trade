"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState("");
  const [siteName, setSiteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setSiteName(data.site_name || "OKAIBI Trading");
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    const body: Record<string, string> = { site_name: siteName };
    if (newPassword) body.new_password = newPassword;

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMsg("保存成功 ✅");
      setNewPassword("");
    } else {
      setMsg("保存失败 ❌");
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">网站名称</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">修改密码（留空不修改）</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入新密码"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {msg && <p className="text-sm text-green-600">{msg}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? "保存中..." : "保存设置"}
          </button>
        </div>
      </div>
    </div>
  );
}
