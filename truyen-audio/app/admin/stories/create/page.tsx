"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createStory, createEpisode } from "@/app/actions/stories";

export default function AdminCreateStoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [storyForm, setStoryForm] = useState({ title: "", slug: "", description: "", coverImage: "", isVip: false, categoryId: "" });
  const [storyError, setStoryError] = useState("");
  const [storyLoading, setStoryLoading] = useState(false);
  const [createdStoryId, setCreatedStoryId] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Function to generate slug from title
  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Remove duplicate -
  }

  // Auto-generate slug when title changes (unless manually edited)
  function handleTitleChange(newTitle: string) {
    setStoryForm((f) => ({ 
      ...f, 
      title: newTitle,
      slug: slugManuallyEdited ? f.slug : generateSlug(newTitle)
    }));
  }

  // Mark slug as manually edited when user changes it
  function handleSlugChange(newSlug: string) {
    setSlugManuallyEdited(true);
    setStoryForm((f) => ({ ...f, slug: newSlug }));
  }

  const [episodeForm, setEpisodeForm] = useState({ title: "", audioUrl: "", order: 1, duration: 0, isFreePreview: false });
  const [episodeError, setEpisodeError] = useState("");
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [episodes, setEpisodes] = useState<{ id: string; title: string; order: number }[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  async function handleCreateStory(e: React.FormEvent) {
    e.preventDefault();
    setStoryError("");
    setStoryLoading(true);
    const result = await createStory(storyForm);
    setStoryLoading(false);
    if (!result.success) { setStoryError(result.message); return; }
    setCreatedStoryId((result.data as { storyId: string }).storyId);
  }

  async function handleAddEpisode(e: React.FormEvent) {
    e.preventDefault();
    if (!createdStoryId) return;
    setEpisodeError("");
    setEpisodeLoading(true);
    const result = await createEpisode(createdStoryId, episodeForm);
    setEpisodeLoading(false);
    if (!result.success) { setEpisodeError(result.message); return; }
    setEpisodes((prev) => [...prev, { id: (result.data as { episodeId: string }).episodeId, title: episodeForm.title, order: episodeForm.order }]);
    setEpisodeForm({ title: "", audioUrl: "", order: episodeForm.order + 1, duration: 0, isFreePreview: false });
  }

  function handleFinish() {
    router.push("/admin/stories");
  }

  const inputClass = "w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Tạo truyện mới</h1>

      {!createdStoryId ? (
        <form onSubmit={handleCreateStory} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Tiêu đề</label>
            <input type="text" required value={storyForm.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Slug (tự động tạo từ tiêu đề)</label>
            <input type="text" required pattern="^[a-z0-9-]+$" value={storyForm.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="vi-du-slug" className={inputClass} />
            <p className="mt-1 text-xs text-gray-500">Slug sẽ tự động tạo từ tiêu đề. Bạn có thể chỉnh sửa nếu cần.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Mô tả</label>
            <textarea required rows={4} value={storyForm.description} onChange={(e) => setStoryForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">URL ảnh bìa</label>
            <input type="url" required value={storyForm.coverImage} onChange={(e) => setStoryForm((f) => ({ ...f, coverImage: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Danh mục</label>
            <select value={storyForm.categoryId} onChange={(e) => setStoryForm((f) => ({ ...f, categoryId: e.target.value }))} className={inputClass}>
              <option value="">Không có danh mục</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isVip" checked={storyForm.isVip} onChange={(e) => setStoryForm((f) => ({ ...f, isVip: e.target.checked }))} className="h-4 w-4 rounded" />
            <label htmlFor="isVip" className="text-sm text-gray-300">Truyện VIP</label>
          </div>
          {storyError && <p className="text-sm text-red-400">{storyError}</p>}
          <button type="submit" disabled={storyLoading} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
            {storyLoading ? "Đang tạo..." : "Tạo truyện"}
          </button>
        </form>
      ) : (
        <>
          <div className="mb-6 rounded-lg bg-green-900/20 p-4">
            <p className="text-sm font-medium text-green-300">Đã tạo truyện &quot;{storyForm.title}&quot; thành công! Thêm tập hoặc hoàn tất.</p>
          </div>

          {episodes.length > 0 && (
            <div className="mb-6 space-y-1">
              <h3 className="text-sm font-medium text-gray-300">Các tập đã thêm:</h3>
              {episodes.map((ep) => <p key={ep.id} className="text-sm text-gray-500">Tập {ep.order}: {ep.title}</p>)}
            </div>
          )}

          <h2 className="mb-4 text-lg font-semibold text-white">Thêm tập mới</h2>
          <form onSubmit={handleAddEpisode} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Tiêu đề tập</label>
              <input type="text" required value={episodeForm.title} onChange={(e) => setEpisodeForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">URL audio</label>
              <input type="url" required value={episodeForm.audioUrl} onChange={(e) => setEpisodeForm((f) => ({ ...f, audioUrl: e.target.value }))} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Thứ tự</label>
                <input type="number" required min={1} value={episodeForm.order} onChange={(e) => setEpisodeForm((f) => ({ ...f, order: parseInt(e.target.value) || 1 }))} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Thời lượng (giây)</label>
                <input type="number" required min={1} value={episodeForm.duration || ""} onChange={(e) => setEpisodeForm((f) => ({ ...f, duration: parseInt(e.target.value) || 0 }))} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFreePreview" checked={episodeForm.isFreePreview} onChange={(e) => setEpisodeForm((f) => ({ ...f, isFreePreview: e.target.checked }))} className="h-4 w-4 rounded" />
              <label htmlFor="isFreePreview" className="text-sm text-gray-300">Cho phép nghe thử miễn phí</label>
            </div>
            {episodeError && <p className="text-sm text-red-400">{episodeError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={episodeLoading} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                {episodeLoading ? "Đang thêm..." : "Thêm tập"}
              </button>
              <button type="button" onClick={handleFinish} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                Hoàn tất → Về danh sách
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
