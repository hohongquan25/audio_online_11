"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/app/actions/stories";

interface Category { id: string; name: string; slug: string; emoji: string; }

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", emoji: "📚" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createCategory(form);
    if (result.success) {
      setForm({ name: "", slug: "", emoji: "📚" });
      const cats = await fetch("/api/admin/categories").then((r) => r.json());
      setCategories(cats);
      router.refresh();
    }
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa danh mục này? Truyện trong danh mục sẽ không bị xóa.")) return;
    const result = await deleteCategory(id);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    setMessage({ type: result.success ? "success" : "error", text: result.message });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Quản lý danh mục</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-8 space-y-3 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Emoji</label>
            <input type="text" required value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Tên</label>
            <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ngôn Tình" className="w-full rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Slug</label>
            <input type="text" required pattern="^[a-z0-9-]+$" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="ngon-tinh" className="w-full rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
          {loading ? "Đang tạo..." : "Tạo danh mục"}
        </button>
      </form>

      {message && <div className={`mb-4 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}>{message.text}</div>}

      {/* List */}
      {categories.length === 0 ? (
        <p className="text-gray-500">Chưa có danh mục nào.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-3">
              <div>
                <span className="mr-2">{cat.emoji}</span>
                <span className="text-sm font-medium text-gray-200">{cat.name}</span>
                <span className="ml-2 text-xs text-gray-500">({cat.slug})</span>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-400 hover:text-red-300">Xóa</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
