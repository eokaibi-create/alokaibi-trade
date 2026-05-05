"use client";

import { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r=>r.json()).then(setProducts);
    fetch("/api/categories").then(r=>r.json()).then(setCats);
  }, []);

  const save = async () => {
    setLoading(true);
    const isNew = !editing.id;
    const res = await fetch("/api/products", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setProducts(await fetch("/api/products").then(r=>r.json()));
      setEditing(null);
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    setProducts(await fetch("/api/products").then(r=>r.json()));
  };

  const catName = (p: any) => {
    try { return JSON.parse(p.category_name || "{}").en || p.category_name; }
    catch { return p.category_name || "-"; }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">产品管理</h1>
        <button onClick={() => setEditing({ name: JSON.stringify({en:"",zh:"",ar:""}), slug: "", category_id: cats[0]?.id || "", description: "", is_external: false, external_url: "", sort_order: 0 })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ 新增产品</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <h2 className="font-bold mb-4">{editing.id ? "编辑产品" : "新增产品"}</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="名称 (JSON: en/zh/ar)" value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} />
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Slug" value={editing.slug} onChange={e=>setEditing({...editing, slug:e.target.value})} />
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={editing.category_id} onChange={e=>setEditing({...editing, category_id:e.target.value})}>
                {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="描述" value={editing.description} onChange={e=>setEditing({...editing, description:e.target.value})} />
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="图片URL" value={editing.image_url} onChange={e=>setEditing({...editing, image_url:e.target.value})} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_external} onChange={e=>setEditing({...editing, is_external:e.target.checked})} /> 外部链接</label>
              {editing.is_external && (
                <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="外部URL" value={editing.external_url} onChange={e=>setEditing({...editing, external_url:e.target.value})} />
              )}
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
            <tr><th className="text-left p-3">名称</th><th className="text-left p-3">分类</th><th className="text-left p-3">Slug</th><th className="text-center p-3">外部</th><th className="text-right p-3">排序</th><th className="text-right p-3">操作</th></tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-gray-400 text-xs">{catName(p)}</td>
                <td className="p-3 text-gray-400">{p.slug}</td>
                <td className="p-3 text-center">{p.is_external ? "🔗" : "-"}</td>
                <td className="p-3 text-right">{p.sort_order}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-blue-500 hover:text-blue-700 mr-3 text-xs">编辑</button>
                  <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="p-6 text-gray-400 text-center">暂无产品</div>}
      </div>
    </div>
  );
}
