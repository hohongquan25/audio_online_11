"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addStoryComment, deleteStoryComment } from "@/app/actions/storyComments";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

export default function StoryComments({ storyId, comments, currentUserId }: {
  storyId: string;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const result = await addStoryComment(storyId, content);
    if (result.success) { setContent(""); router.refresh(); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteStoryComment(id);
    router.refresh();
    setDeletingId(null);
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">💬 Bình luận ({comments.length})</h2>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} maxLength={2000}
            placeholder="Viết bình luận..."
            className="flex-1 rounded-lg border border-[var(--bg-card-border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-purple-500 focus:outline-none" />
          <button type="submit" disabled={loading || !content.trim()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
            {loading ? "..." : "Gửi"}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          <a href="/login" className="text-purple-400 underline">Đăng nhập</a> để bình luận.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Chưa có bình luận nào.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-[var(--bg-card-border)] bg-[var(--bg-card)] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-medium text-white">
                    {(c.author.name?.[0] ?? c.author.email[0]).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{c.author.name ?? c.author.email}</span>
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(c.createdAt)}</span>
                </div>
                {currentUserId === c.author.id && (
                  <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Xóa</button>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
