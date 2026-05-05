"use client";

import { useState, useEffect, useRef } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const uploadImage = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setEditing({ ...editing, image_url: data.url });
    } else {
      alert("Upload failed: " + (data.error || "Unknown error"));
    }
    setUploading(false);
  };

  const catName = (p: any) => {
    try { return JSON.parse(p.category_name || "{}").en || p.category_name; }
    catch { return p.category_name || "-"; }
  };

  const prodName = (p: any) => {
    try { const n = JSON.parse(p.name || "{}"); return n.en || n.zh || p.name; }
    catch { return p.name; }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 产品管理</h1>
        <button onClick={() => setEditing({ name: JSON.stringify({en:"",zh:""}), slug: "", category_id: cats[0]?.id || "", description: "", image_url: "", is_external: false, external_url: "", sort_order: 0 })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ 新增产品</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h2 className="font-bold mb-4 text-lg">{editing.id ? "✏️ 编辑产品" : "➕ 新增产品"}</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder='名称 JSON: {"en":"...","zh":"..."}' value={editing.name} onChange={e=>setEditing({...editing, name:e.target.value})} />
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Slug (如: led-strip)" value={editing.slug} onChange={e=>setEditing({...editing, slug:e.target.value})} />
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={editing.category_id} onChange={e=>setEditing({...editing, category_id:e.target.value})}>
                {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="描述" value={editing.description || ""} onChange={e=>setEditing({...editing, description:e.target.value})} />

              {/* Image upload */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">产品图片</label>
                <div className="flex gap-2 items-start">
                  <input className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="图片 URL" value={editing.image_url || ""} onChange={e=>setEditing({...editing, image_url:e.target.value})} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50 whitespace-nowrap">
                    {uploading ? "上传中..." : "上传"}
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                {editing.image_url && (
                  <img src={editing.image_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border" />
                )}
              </div>

              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_external} onChange={e=>setEditing({...editing, is_external:e.target.checked})} /> 外部链接</label>
              {editing.is_external && (
                <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="外部URL" value={editing.external_url} onChange={e=>setEditing({...editing, external_url:e.target.value})} />
              )}
              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="排序" type="number" value={editing.sort_order} onChange={e=>setEditing({...editing, sort_order:parseInt(e.target.value)||0})} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button onClick={save} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700">{loading ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 w-12">图片</th>
                <th className="text-left p-3">名称</th>
                <th className="text-left p-3 hidden md:table-cell">分类</th>
                <th className="text-left p-3 hidden md:table-cell">Slug</th>
                <th className="text-center p-3 w-16">外部</th>
                <th className="text-right p-3 w-16">排序</th>
                <th className="text-right p-3 w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">📷</div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{prodName(p)}</td>
                  <td className="p-3 text-gray-400 text-xs hidden md:table-cell">{catName(p)}</td>
                  <td className="p-3 text-gray-400 hidden md:table-cell">{p.slug}</td>
                  <td className="p-3 text-center">{p.is_external ? "🔗" : "-"}</td>
                  <td className="p-3 text-right">{p.sort_order}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="text-blue-500 hover:text-blue-700 mr-2 text-xs">编辑</button>
                    <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <div className="p-6 text-gray-400 text-center">暂无产品</div>}
      </div>
    </div>
  );
}
