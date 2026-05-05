"use client";

import { useState, useEffect } from "react";

interface Stats {
  products: number; categories: number; inquiries: number;
  pending_inquiries: number; contacts: number; pending_contacts: number;
  customers: number; brands: number;
  today_inquiries: number; today_contacts: number;
  category_distribution: { name: string; slug: string; count: number }[];
  products_by_category: { name: string; slug: string; count: number }[];
  monthly_inquiries: { month: string; count: number }[];
  monthly_contacts: { month: string; count: number }[];
  top_inquiry_categories: { category: string; count: number }[];
  inquiry_status: { status: string; count: number }[];
  contact_status: { status: string; count: number }[];
  recent_inquiries: { id: string; name: string; email: string; category: string; product_name: string; status: string; created_at: string }[];
  recent_contacts: { id: string; name: string; email: string; subject: string; status: string; created_at: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  replied: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
};

const MONTH_COLORS = [
  "#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8",
  "#6366f1", "#818cf8", "#a5b4fc", "#4f46e5", "#4338ca",
  "#8b5cf6", "#a78bfa",
];

// ─── Mini Bar Chart ───────────────────────
function BarChart({ data, color = "#3b82f6", height = 160 }: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
            style={{
              height: `${(d.value / max) * 100}%`,
              backgroundColor: color,
              minHeight: d.value > 0 ? 4 : 0,
            }}
          />
          <span className="text-[10px] text-gray-400 -rotate-45 origin-left whitespace-nowrap">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────
function DonutChart({ data, size = 160 }: {
  data: { label: string; value: number }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#6366f1", "#818cf8", "#8b5cf6", "#a78bfa", "#c084fc", "#e879f9"];
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const start = cumulative;
    cumulative += (d.value / total) * 360;
    return { ...d, start, end: cumulative, color: colors[i % colors.length] };
  });

  // Build SVG arc paths
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const polarToCart = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const p1 = polarToCart(seg.start);
          const p2 = polarToCart(seg.end);
          const largeArc = seg.end - seg.start > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`}
              fill={seg.color}
              stroke="white"
              strokeWidth="2"
            >
              <title>{seg.label}: {seg.value}</title>
            </path>
          );
        })}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">
          Total
        </text>
      </svg>
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {segments.slice(0, 6).map((s, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} ({s.value})
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────
function SummaryCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        <div className={`w-2 h-2 rounded-full ${color}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-300 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Main Dashboard ──────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        const data = await r.json();
        setStats(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <h2 className="font-semibold text-red-700 mb-1">Failed to load data</h2>
        <p className="text-sm text-red-500">{error || "Unknown error"}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">
          Retry
        </button>
      </div>
    );
  }

  const productDist = stats.products_by_category || [];
  const monthlyInq = (stats.monthly_inquiries || []).map((d) => ({
    label: d.month?.slice(5) || d.month,
    value: d.count,
  }));
  const catDist = stats.category_distribution || [];
  const inqStatus = stats.inquiry_status || [];
  const contactStatus = stats.contact_status || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Today's Activity Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm opacity-80">📅 Today</span>
          <span className="font-bold">{stats.today_inquiries} inquiries</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="font-bold">{stats.today_contacts} messages</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="font-bold">{stats.pending_inquiries} pending</span>
          <span className="ml-auto text-sm opacity-70">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon="📦" label="Products" value={stats.products} color="bg-blue-500" />
        <SummaryCard icon="📁" label="Categories" value={stats.categories} color="bg-green-500" />
        <SummaryCard icon="📋" label="Inquiries" value={stats.inquiries}
          sub={`${stats.pending_inquiries} pending`} color="bg-purple-500" />
        <SummaryCard icon="👥" label="Customers" value={stats.customers}
          sub={`${stats.brands} brands`} color="bg-pink-500" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Inquiry Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">📈 Inquiry Trends (Monthly)</h3>
          {monthlyInq.length > 0 ? (
            <div className="pt-2">
              <BarChart data={monthlyInq} color="#3b82f6" height={180} />
              <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>Total: {monthlyInq.reduce((s, d) => s + d.value, 0)}</span>
                <span>Avg: {Math.round(monthlyInq.reduce((s, d) => s + d.value, 0) / monthlyInq.length)}/month</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-gray-300 text-sm">
              No inquiry data yet
            </div>
          )}
        </div>

        {/* Products by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">📊 Products by Category</h3>
          {productDist.length > 0 ? (
            <div className="space-y-3">
              {productDist.map((c, i) => {
                const pct = stats.products > 0 ? Math.round((c.count / stats.products) * 100) : 0;
                return (
                  <div key={c.slug} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{c.name}</span>
                      <span className="text-gray-400">{c.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${MONTH_COLORS[i % MONTH_COLORS.length]}, ${MONTH_COLORS[(i + 1) % MONTH_COLORS.length]})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-gray-300 text-sm">
              No products yet
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry Status Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Inquiry Status</h3>
          {inqStatus.length > 0 ? (
            <DonutChart data={inqStatus.map((s) => ({ label: s.status, value: s.count }))} size={160} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-300 text-sm">
              No inquiries yet
            </div>
          )}
        </div>

        {/* Contact Status Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">💬 Message Status</h3>
          {contactStatus.length > 0 ? (
            <DonutChart data={contactStatus.map((s) => ({ label: s.status, value: s.count }))} size={160} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-300 text-sm">
              No messages yet
            </div>
          )}
        </div>

        {/* Top Inquiry Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">🏆 Top Inquiry Categories</h3>
          {stats.top_inquiry_categories.length > 0 ? (
            <div className="space-y-2">
              {stats.top_inquiry_categories.map((c, i) => {
                const max = Math.max(...stats.top_inquiry_categories.map((x) => x.count), 1);
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="text-gray-700">{c.category}</span>
                        <span className="text-gray-400">{c.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-300 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">📩 Recent Inquiries</h3>
            <a href="/admin/inquiries" className="text-xs text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          {stats.recent_inquiries.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {stats.recent_inquiries.map((r) => (
                <div key={r.id} className="px-5 py-3 hover:bg-gray-50 transition flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {r.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{r.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"
                      }`}>{r.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {r.product_name || r.category || "General inquiry"} · {r.email}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-300 shrink-0">{r.created_at?.slice(0, 10)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-gray-300 text-sm">No inquiries yet</div>
          )}
        </div>

        {/* Recent Contact Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">💬 Recent Messages</h3>
            <a href="/admin/inquiries" className="text-xs text-blue-600 hover:text-blue-700">View all →</a>
          </div>
          {stats.recent_contacts.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {stats.recent_contacts.map((r) => (
                <div key={r.id} className="px-5 py-3 hover:bg-gray-50 transition flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {r.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{r.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"
                      }`}>{r.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {r.subject || "No subject"} · {r.email}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-300 shrink-0">{r.created_at?.slice(0, 10)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-gray-300 text-sm">No messages yet</div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Quick Stats Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Conversion Rate", value: stats.inquiries > 0 && stats.contacts > 0
              ? `${Math.round((stats.inquiries / (stats.inquiries + stats.contacts)) * 100)}%`
              : "0%", icon: "📈", color: "text-blue-600" },
            { label: "Response Rate", value: stats.inquiries > 0
              ? `${Math.round(((stats.inquiries - stats.pending_inquiries) / stats.inquiries) * 100)}%`
              : "0%", icon: "✅", color: "text-green-600" },
            { label: "Products / Category", value: stats.categories > 0
              ? (stats.products / stats.categories).toFixed(1)
              : "0", icon: "📊", color: "text-purple-600" },
            { label: "Total Interactions", value: stats.inquiries + stats.contacts, icon: "💬", color: "text-teal-600" },
          ].map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-2xl mb-1 ${s.color}`}>{s.icon}</div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
