"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateStory, createEpisode, updateEpisode, deleteEpisode } from "@/app/actions/stories";
import { formatDuration } from "@/lib/utils";

interface Episode { id: string; title: string; order: number; duration: number; audioUrl: string; isFreePreview: boolean; }

const ic = "w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none";

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  const [form, setForm] = useState({ title: "", description: "", coverImage: "", isVip: false, categoryId: "", status: "ongoing" });
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Episode form
  const [epForm, setEpForm] = useState({ title: "", audioUrl: "", order: 1, duration: 0, isFreePreview: false });
  const [epLoading, setEpLoading] = useState(false);
  const [epMsg, setEpMsg] = useState("");

  // Edit episode
  const [editEpId, setEditEpId] = useState<string | null>(null);
  const [editEpForm, setEditEpForm] = useState({ title: "", audioUrl: "", order: 1, duration: 0, isFreePreview: false });
  const [editEpLoading, setEditEpLoading] = useState(false);

  async function loadEpisodes() {
    const eps = await fetch(`/api/admin/story/${storyId}/episodes`).then(r => r.json());
    setEpisodes(eps || []);
    setEpForm(f => ({ ...f, order: (eps?.length || 0) + 1 }));
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/story/${storyId}`).then(r => r.json()),
      fetch("/api/admin/categories").then(r => r.json()),
      fetch(`/api/admin/story/${storyId}/episodes`).then(r => r.json()),
    ]).then(([story, cats, eps]) => {
      setForm({ title: story.title || "", description: story.description || "", coverImage: story.coverImage || "", isVip: story.isVip || false, categoryId: story.categoryId || "", status: story.status || "ongoing" });
      setCategories(cats);
      setEpisodes(eps || []);
      setEpForm(f => ({ ...f, order: (eps?.length || 0) + 1 }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [storyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const result = await updateStory(storyId, { title: form.title, description: form.description, coverImage: form.coverImage, isVip: form.isVip, categoryId: form.categoryId || null });
    setMsg({ type: result.success ? "success" : "error", text: result.message });
    setSaving(false);
    if (result.success) router.push("/admin/stories");
  }

  async function handleAddEpisode(e: React.FormEvent) {
    e.preventDefault();
    setEpLoading(true); setEpMsg("");
    const result = await createEpisode(storyId, epForm);
    if (result.success) {
      await loadEpisodes();
      setEpForm(f => ({ title: "", audioUrl: "", order: f.order + 1, duration: 0, isFreePreview: false }));
      setEpMsg("✓ Đã thêm tập");
    } else { setEpMsg(result.message); }
    setEpLoading(false);
  }

  function startEditEp(ep: Episode) {
    setEditEpId(ep.id);
    setEditEpForm({ title: ep.title, audioUrl: ep.audioUrl, order: ep.order, duration: ep.duration, isFreePreview: ep.isFreePreview });
  }

  async function handleUpdateEp(e: React.FormEvent) {
    e.preventDefault();
    if (!editEpId) return;
    setEditEpLoading(true);
    const result = await updateEpisode(editEpId, editEpForm);
    if (result.success) { await loadEpisodes(); setEditEpId(null); }
    setEditEpLoading(false);
  }

  async function handleDeleteEp(epId: string) {
    if (!confirm("Xóa tập này?")) return;
    await deleteEpisode(epId);
    await loadEpisodes();
  }

  if (loading) return <div className="text-gray-400">Đang tải...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Story info */}
      <div>
        <h1 className="mb-4 text-2xl font-bold text-white">Chỉnh sửa truyện</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-gray-400">Tiêu đề</label><input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={ic} /></div>
            <div><label className="mb-1 block text-xs text-gray-400">URL ảnh bìa</label><input type="url" required value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className={ic} /></div>
          </div>
          <div><label className="mb-1 block text-xs text-gray-400">Mô tả</label><textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={ic} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs text-gray-400">Danh mục</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={ic}>
                <option value="">Không có</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-xs text-gray-400">Trạng thái</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={ic}>
                <option value="ongoing">Đang cập nhật</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.isVip} onChange={e => setForm(f => ({ ...f, isVip: e.target.checked }))} className="h-4 w-4 rounded" />Truyện VIP</label>
          {msg && <div className={`rounded-lg p-2 text-sm ${msg.type === "success" ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}>{msg.text}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thông tin"}</button>
            <button type="button" onClick={() => router.back()} className="rounded-lg border border-[#2a2a4a] px-5 py-2 text-sm text-gray-400 hover:text-white">Hủy</button>
          </div>
        </form>
      </div>

      {/* Episodes */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Danh sách tập ({episodes.length})</h2>

        {episodes.length > 0 && (
          <div className="mb-4 rounded-lg border border-[#2a2a4a] overflow-hidden">
            {episodes.map(ep => (
              <div key={ep.id}>
                {editEpId === ep.id ? (
                  /* Edit form inline */
                  <form onSubmit={handleUpdateEp} className="border-b border-[#2a2a4a] bg-[#0f0f23] p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" required value={editEpForm.title} onChange={e => setEditEpForm(f => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề" className={ic} />
                      <input type="url" required value={editEpForm.audioUrl} onChange={e => setEditEpForm(f => ({ ...f, audioUrl: e.target.value }))} placeholder="URL audio" className={ic} />
                      <input type="number" required min={1} value={editEpForm.order} onChange={e => setEditEpForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))} placeholder="Thứ tự" className={ic} />
                      <input type="number" required min={1} value={editEpForm.duration || ""} onChange={e => setEditEpForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))} placeholder="Thời lượng (giây)" className={ic} />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={editEpForm.isFreePreview} onChange={e => setEditEpForm(f => ({ ...f, isFreePreview: e.target.checked }))} className="h-3 w-3" />Miễn phí</label>
                    <div className="flex gap-2">
                      <button type="submit" disabled={editEpLoading} className="rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-50">{editEpLoading ? "..." : "Lưu"}</button>
                      <button type="button" onClick={() => setEditEpId(null)} className="rounded border border-[#2a2a4a] px-3 py-1 text-xs text-gray-400">Hủy</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 border-b border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2.5 last:border-0">
                    <span className="w-6 text-xs text-gray-500">{ep.order}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-gray-200">{ep.title}</p>
                      <p className="text-xs text-gray-500">{formatDuration(ep.duration)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ep.isFreePreview ? <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-[10px] text-green-400">Free</span> : <span className="rounded bg-yellow-900/30 px-1.5 py-0.5 text-[10px] text-yellow-400">VIP</span>}
                      <button onClick={() => startEditEp(ep)} className="text-xs text-blue-400 hover:text-blue-300">Sửa</button>
                      <button onClick={() => handleDeleteEp(ep.id)} className="text-xs text-red-400 hover:text-red-300">Xóa</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add episode form */}
        <form onSubmit={handleAddEpisode} className="space-y-3 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
          <h3 className="text-sm font-medium text-gray-300">Thêm tập mới</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs text-gray-400">Tiêu đề tập</label><input type="text" required value={epForm.title} onChange={e => setEpForm(f => ({ ...f, title: e.target.value }))} className={ic} /></div>
            <div><label className="mb-1 block text-xs text-gray-400">URL audio</label><input type="url" required value={epForm.audioUrl} onChange={e => setEpForm(f => ({ ...f, audioUrl: e.target.value }))} className={ic} /></div>
            <div><label className="mb-1 block text-xs text-gray-400">Thứ tự</label><input type="number" required min={1} value={epForm.order} onChange={e => setEpForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))} className={ic} /></div>
            <div><label className="mb-1 block text-xs text-gray-400">Thời lượng (giây)</label><input type="number" required min={1} value={epForm.duration || ""} onChange={e => setEpForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))} className={ic} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={epForm.isFreePreview} onChange={e => setEpForm(f => ({ ...f, isFreePreview: e.target.checked }))} className="h-4 w-4 rounded" />Miễn phí (Free Preview)</label>
          {epMsg && <p className={`text-xs ${epMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{epMsg}</p>}
          <button type="submit" disabled={epLoading} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">{epLoading ? "Đang thêm..." : "+ Thêm tập"}</button>
        </form>
      </div>
    </div>
  );
}
