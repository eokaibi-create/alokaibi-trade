"use client";

import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/categories").then(r=>r.json()).then(setCats); }, []);

  const save = async () => {
    setLoading(true);
    const isNew = !editing.id;
    const res = await fetch("/api/categories", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const data = await fetch("/api/categories").then(r=>r.json());
      setCats(data);
      setEditing(null);
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    setCats(await fetch("/api/categories").then(r=>r.json()));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <button onClick={() => setEditing({ name: JSON.stringify({en:"",zh:"",ar:""}), slug: "", icon: "", sort_order: 0 })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ 新增分类</button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <h2 className="font-bold mb-4">{editing.id ? "编辑分类" : "新增分类"}</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="名称 (JSON: en/zh/ar)" value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} />
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Slug (唯一标识)" value={editing.slug} onChange={e=>setEditing({...editing, slug:e.target.value})} />
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="图标 (Emoji)" value={editing.icon} onChange={e=>setEditing({...editing, icon:e.target.value})} />
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="排序" type="number" value={editing.sort_order} onChange={e=>setEditing({...editing, sort_order:parseInt(e.target.value)||0})} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">取消</button>
              <button onClick={save} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">{loading ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left p-3">图标</th><th className="text-left p-3">名称</th><th className="text-left p-3">Slug</th><th className="text-left p-3">排序</th><th className="text-right p-3">操作</th></tr>
          </thead>
          <tbody>
            {cats.map((c: any) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-xl">{c.icon}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-gray-400">{c.slug}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(c)} className="text-blue-500 hover:text-blue-700 mr-3 text-xs">编辑</button>
                  <button onClick={() => del(c.id)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cats.length === 0 && <div className="p-6 text-gray-400 text-center">暂无分类</div>}
      </div>
    </div>
  );
}
