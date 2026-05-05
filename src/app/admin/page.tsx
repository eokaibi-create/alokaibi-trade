"use client";

import { useState, useEffect } from "react";

interface Stats {
  products: number; categories: number; inquiries: number;
  pending_inquiries: number; contacts: number; pending_contacts: number; customers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/inquiries").then((r) => r.json()).then((d) => setRecent(d.slice(0, 5))).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: "产品总数", value: stats.products, color: "bg-blue-500" },
    { label: "分类", value: stats.categories, color: "bg-green-500" },
    { label: "询盘总数", value: stats.inquiries, color: "bg-purple-500" },
    { label: "待处理询盘", value: stats.pending_inquiries, color: "bg-orange-500" },
    { label: "联系消息", value: stats.contacts, color: "bg-teal-500" },
    { label: "客户资料", value: stats.customers, color: "bg-pink-500" },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

      {cards.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className={`w-3 h-3 rounded-full ${c.color} mb-2`} />
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-sm text-gray-400">{c.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 mb-8">加载中...</div>
      )}

      <h2 className="text-lg font-semibold mb-3">最新询盘</h2>
      {recent.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {recent.map((r: any) => (
            <div key={r.id} className="flex items-center gap-3 p-3 border-b last:border-0 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs ${
                r.status === "pending" ? "bg-orange-100 text-orange-600" :
                r.status === "replied" ? "bg-green-100 text-green-600" : "bg-gray-100"
              }`}>{r.status}</span>
              <span className="font-medium">{r.name}</span>
              <span className="text-gray-400 text-xs">{r.email}</span>
              <span className="text-gray-300 ml-auto text-xs">{r.created_at}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400">暂无数据</div>
      )}
    </div>
  );
}
