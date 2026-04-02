"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComment, deleteComment } from "@/app/actions/community";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

interface CommentSectionProps {
  postId: string;
  comments: CommentData[];
  currentUserId: string | null;
}

export default function CommentSection({ postId, comments, currentUserId }: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createComment(postId, content.trim());
      if (result.success) {
        setContent("");
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-3 border-t border-[#2a2a4a] pt-3">
      {comments.length > 0 && (
        <ul className="space-y-3 mb-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-2 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2a2a4a] text-xs font-medium text-gray-400">
                {(comment.author.name?.[0] ?? comment.author.email[0]).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-300">{comment.author.name ?? comment.author.email}</span>
                  <span className="text-xs text-gray-600">{formatDate(comment.createdAt)}</span>
                  {currentUserId === comment.author.id && (
                    <button onClick={() => handleDelete(comment.id)} disabled={deletingId === comment.id}
                      className="ml-auto text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                      {deletingId === comment.id ? "..." : "Xóa"}
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-gray-400">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viết bình luận..." maxLength={2000}
            className="flex-1 rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none" />
          <button type="submit" disabled={loading || !content.trim()}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50">
            Gửi
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
