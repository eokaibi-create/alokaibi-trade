"use client";

import { useState, useEffect } from "react";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyMsg, setReplyMsg] = useState("");

  useEffect(() => { fetch("/api/inquiries").then(r=>r.json()).then(setInquiries); }, []);

  const openDetail = async (id: string) => {
    const res = await fetch(`/api/inquiries?id=${id}`).then(r=>r.json());
    setDetail(res.inquiry);
    setReplies(res.replies || []);
    setReplyMsg("");
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/inquiries", { method: "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({id, status}) });
    setInquiries(await fetch("/api/inquiries").then(r=>r.json()));
    if (detail) setDetail({...detail, status});
  };

  const sendReply = async () => {
    if (!replyMsg.trim() || !detail) return;
    await fetch("/api/inquiry-replies", { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({inquiry_id: detail.id, message: replyMsg}) });
    setReplyMsg("");
    const res = await fetch(`/api/inquiries?id=${detail.id}`).then(r=>r.json());
    setReplies(res.replies || []);
    updateStatus(detail.id, "replied");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">询盘管理</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left p-3">状态</th><th className="text-left p-3">客户</th><th className="text-left p-3">分类</th><th className="text-left p-3 hidden md:table-cell">产品</th><th className="text-right p-3">时间</th><th className="text-right p-3">操作</th></tr>
          </thead>
          <tbody>
            {inquiries.map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${r.status==="pending"?"bg-orange-100 text-orange-600":r.status==="replied"?"bg-green-100 text-green-600":"bg-gray-100"}`}>{r.status}</span></td>
                <td className="p-3 font-medium">{r.name}<br/><span className="text-gray-400 text-xs">{r.email}</span></td>
                <td className="p-3 text-gray-400 text-xs">{r.category}</td>
                <td className="p-3 text-gray-400 text-xs hidden md:table-cell">{r.product_name || "-"}</td>
                <td className="p-3 text-right text-gray-400 text-xs">{r.created_at}</td>
                <td className="p-3 text-right"><button onClick={() => openDetail(r.id)} className="text-blue-500 hover:text-blue-700 text-xs">详情</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {inquiries.length === 0 && <div className="p-6 text-gray-400 text-center">暂无询盘</div>}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-bold text-lg">询盘详情</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div><span className="text-gray-400">客户：</span>{detail.name}</div>
              <div><span className="text-gray-400">邮箱：</span>{detail.email}</div>
              <div><span className="text-gray-400">电话：</span>{detail.phone || "-"}</div>
              <div><span className="text-gray-400">公司：</span>{detail.company || "-"}</div>
              <div><span className="text-gray-400">分类：</span>{detail.category}</div>
              <div><span className="text-gray-400">产品：</span>{detail.product_name || "-"}</div>
              <div><span className="text-gray-400">数量：</span>{detail.quantity || "-"}</div>
              <div><span className="text-gray-400">状态：</span>
                <select value={detail.status} onChange={e=>updateStatus(detail.id, e.target.value)} className="ml-2 border rounded px-2 py-0.5 text-xs">
                  <option value="pending">Pending</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg"><span className="text-gray-400">消息：</span><br/>{detail.message}</div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">回复记录</h3>
              {replies.map((r: any) => (
                <div key={r.id} className="p-3 bg-blue-50 rounded-lg mb-2 text-sm">{r.message}<div className="text-xs text-gray-400 mt-1">{r.created_at}</div></div>
              ))}
              <div className="flex gap-2 mt-3">
                <textarea className="flex-1 px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="输入回复..." value={replyMsg} onChange={e=>setReplyMsg(e.target.value)} />
                <button onClick={sendReply} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm self-end">发送</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
