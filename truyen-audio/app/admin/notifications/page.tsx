"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNotification, updateNotification, deleteNotification } from "@/app/actions/notifications";

interface Notif { id: string; title: string; content: string; isActive: boolean; createdAt: string; }

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadNotifs(); }, []);

  async function loadNotifs() {
    const r = await fetch("/api/admin/notifications");
    const d = await r.json();
    setNotifs(d);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true); setMsg("");
    const result = editId
      ? await updateNotification(editId, form)
      : await createNotification(form);
    setMsg(result.message);
    if (result.success) {
      setForm({ title: "", content: "" }); setEditId(null);
      await loadNotifs();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa thông báo này?")) return;
    await deleteNotification(id);
    await loadNotifs();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await updateNotification(id, { isActive: !isActive });
    await loadNotifs();
  }

  function handleEdit(n: Notif) {
    setEditId(n.id);
    setForm({ title: n.title, content: n.content });
  }

  const ic = "w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Quản lý thông báo</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
        <h2 className="text-sm font-medium text-gray-300">{editId ? "Sửa thông báo" : "Tạo thông báo mới"}</h2>
        <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề" className={ic} />
        <textarea required rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Nội dung" className={ic} />
        {msg && <p className="text-xs text-green-400">{msg}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50">
            {loading ? "..." : editId ? "Cập nhật" : "Tạo"}
          </button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: "", content: "" }); }} className="rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm text-gray-400">Hủy</button>}
        </div>
      </form>

      {notifs.length === 0 ? (
        <p className="text-gray-500">Chưa có thông báo nào.</p>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} className="flex items-start justify-between rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-200">{n.title}</p>
                  {!n.isActive && <span className="rounded bg-red-900/30 px-1.5 py-0.5 text-[10px] text-red-400">Tắt</span>}
                </div>
                <p className="mt-1 text-xs text-gray-500">{n.content}</p>
                <p className="mt-1 text-[10px] text-gray-600">{new Date(n.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="ml-3 flex shrink-0 gap-2">
                <button onClick={() => handleEdit(n)} className="text-xs text-blue-400 hover:text-blue-300">Sửa</button>
                <button onClick={() => handleToggle(n.id, n.isActive)} className={`text-xs ${n.isActive ? "text-yellow-400" : "text-green-400"}`}>
                  {n.isActive ? "Tắt" : "Bật"}
                </button>
                <button onClick={() => handleDelete(n.id)} className="text-xs text-red-400 hover:text-red-300">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
