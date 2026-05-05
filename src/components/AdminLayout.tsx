"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/categories", label: "分类管理", icon: "📁" },
  { href: "/admin/products", label: "产品管理", icon: "📦" },
  { href: "/admin/inquiries", label: "询盘管理", icon: "📋" },
  { href: "/admin/customers", label: "客户资料", icon: "👥" },
  { href: "/admin/settings", label: "系统设置", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth", { method: "POST", body: JSON.stringify({}) })
      .then((r) => r.json())
      .then((d) => {
        if (d.token) setAuthed(true);
        else if (pathname !== "/admin/login") router.push("/admin/login");
      })
      .catch(() => {
        if (pathname !== "/admin/login") router.push("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!authed) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">OKAIBI CMS</h1>
          <p className="text-xs text-gray-400">管理后台</p>
        </div>
        <nav className="flex-1 p-2">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => {
              fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/admin/login"));
            }}
            className="text-xs text-red-400 hover:text-red-600 w-full text-left"
          >
            🚪 退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
