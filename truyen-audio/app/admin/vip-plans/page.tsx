"use client";

import { useState, useEffect } from "react";
import { createVipPlan, updateVipPlan, deleteVipPlan } from "@/app/actions/vipPlans";

interface Plan { id: string; name: string; days: number; price: number; description: string; isActive: boolean; sortOrder: number; }

const emptyForm = { name: "", days: 30, price: 79000, description: "", sortOrder: 0 };
const ic = "w-full rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none";

export default function AdminVipPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    const r = await fetch("/api/admin/vip-plans");
    const d = await r.json();
    setPlans(d);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const result = editId
      ? await updateVipPlan(editId, form)
      : await createVipPlan(form);
    setMsg(result.message);
    if (result.success) { setForm(emptyForm); setEditId(null); await loadPlans(); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa gói VIP này?")) return;
    await deleteVipPlan(id);
    await loadPlans();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await updateVipPlan(id, { isActive: !isActive });
    await loadPlans();
  }

  function handleEdit(p: Plan) {
    setEditId(p.id);
    setForm({ name: p.name, days: p.days, price: p.price, description: p.description, sortOrder: p.sortOrder });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Quản lý gói VIP</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
        <h2 className="text-sm font-medium text-gray-300">{editId ? "Sửa gói VIP" : "Tạo gói VIP mới"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Tên gói</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VIP Tháng" className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Số ngày</label>
            <input type="number" required min={1} value={form.days} onChange={e => setForm(f => ({ ...f, days: parseInt(e.target.value) || 1 }))} className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Giá (VND)</label>
            <input type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Thứ tự hiển thị</label>
            <input type="number" min={0} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className={ic} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Mô tả</label>
          <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Nghe không giới hạn..." className={ic} />
        </div>
        {msg && <p className="text-xs text-green-400">{msg}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50">
            {loading ? "..." : editId ? "Cập nhật" : "Tạo gói"}
          </button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }} className="rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm text-gray-400">Hủy</button>}
        </div>
      </form>

      {/* List */}
      {plans.length === 0 ? (
        <p className="text-gray-500">Chưa có gói VIP nào. Tạo gói đầu tiên.</p>
      ) : (
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.days} ngày</span>
                  {!p.isActive && <span className="rounded bg-red-900/30 px-1.5 py-0.5 text-[10px] text-red-400">Tắt</span>}
                </div>
                <p className="text-sm font-semibold text-orange-400">{p.price.toLocaleString("vi-VN")}đ</p>
                {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="text-xs text-blue-400 hover:text-blue-300">Sửa</button>
                <button onClick={() => handleToggle(p.id, p.isActive)} className={`text-xs ${p.isActive ? "text-yellow-400" : "text-green-400"}`}>
                  {p.isActive ? "Tắt" : "Bật"}
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
