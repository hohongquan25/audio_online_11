"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleLike, deletePost } from "@/app/actions/community";
import { formatDate } from "@/lib/utils";
import CommentSection from "./CommentSection";

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    type: string;
    likeCount: number;
    createdAt: string;
    author: { id: string; name: string | null; email: string };
    comments: CommentData[];
    _count: { comments: number };
  };
  currentUserId: string | null;
  isLiked: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  general: { label: "💬 Thảo luận", color: "bg-blue-900/30 text-blue-400" },
  feedback: { label: "💡 Góp ý", color: "bg-yellow-900/30 text-yellow-400" },
  bug: { label: "🐛 Báo lỗi", color: "bg-red-900/30 text-red-400" },
};

export default function PostCard({ post, currentUserId, isLiked }: PostCardProps) {
  const router = useRouter();
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const isAuthor = currentUserId === post.author.id;
  const typeConfig = TYPE_CONFIG[post.type] ?? TYPE_CONFIG.general;

  async function handleLike() {
    if (!currentUserId) return;
    setLiking(true);
    try {
      const result = await toggleLike(post.id);
      if (result.success) {
        const data = result.data as { liked: boolean };
        setLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch { /* silently fail */ } finally { setLiking(false); }
  }

  async function handleDelete() {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    setDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) router.refresh();
    } catch { /* silently fail */ } finally { setDeleting(false); }
  }

  return (
    <article className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-4">
      {/* Author header */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">
          {(post.author.name?.[0] ?? post.author.email[0]).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-200">{post.author.name ?? post.author.email}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeConfig.color}`}>{typeConfig.label}</span>
          </div>
          <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
        {isAuthor && (
          <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
            {deleting ? "..." : "Xóa"}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-300">{post.content}</p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 border-t border-[#2a2a4a] pt-3">
        {currentUserId ? (
          <button onClick={handleLike} disabled={liking}
            className={`flex items-center gap-1 text-sm transition-colors disabled:opacity-50 ${liked ? "text-purple-400 font-medium" : "text-gray-500 hover:text-purple-400"}`}
            aria-pressed={liked}>
            <span>👍</span>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <span>👍</span>{likeCount > 0 && likeCount}
          </span>
        )}
        <button onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-400">
          <span>💬</span>
          {post._count.comments > 0 && <span>{post._count.comments}</span>}
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} comments={post.comments} currentUserId={currentUserId} />
      )}
    </article>
  );
}
