"use client";

import { useState, useEffect } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => { fetch("/api/customers").then(r=>r.json()).then(setCustomers); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">客户资料</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left p-3">姓名</th><th className="text-left p-3">邮箱</th><th className="text-left p-3 hidden md:table-cell">电话</th><th className="text-left p-3 hidden lg:table-cell">公司</th><th className="text-left p-3 hidden md:table-cell">来源</th><th className="text-right p-3">时间</th></tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-gray-400 text-xs">{c.email}</td>
                <td className="p-3 text-gray-400 hidden md:table-cell">{c.phone || "-"}</td>
                <td className="p-3 text-gray-400 hidden lg:table-cell">{c.company || "-"}</td>
                <td className="p-3 hidden md:table-cell"><span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-600">{c.source}</span></td>
                <td className="p-3 text-right text-gray-400 text-xs">{c.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <div className="p-6 text-gray-400 text-center">暂无客户</div>}
      </div>
    </div>
  );
}
