"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/community";

const POST_TYPES = [
  { value: "general", label: "💬 Thảo luận", color: "text-blue-400" },
  { value: "feedback", label: "💡 Góp ý", color: "text-yellow-400" },
  { value: "bug", label: "🐛 Báo lỗi", color: "text-red-400" },
];

export default function PostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await createPost(content.trim(), type);
      if (result.success) {
        setContent("");
        setType("general");
        setMessage({ type: "success", text: result.message });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch {
      setMessage({ type: "error", text: "Đã xảy ra lỗi, vui lòng thử lại" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-4">
      {/* Type selector */}
      <div className="mb-3 flex gap-2">
        {POST_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${type === t.value ? "bg-purple-600 text-white" : "border border-[#2a2a4a] text-gray-400 hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={type === "feedback" ? "Chia sẻ góp ý của bạn..." : type === "bug" ? "Mô tả lỗi bạn gặp phải..." : "Chia sẻ suy nghĩ của bạn..."}
        maxLength={5000}
        rows={3}
        className="w-full rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-600">{content.length}/5000</span>
        <button type="submit" disabled={loading || !content.trim()}
          className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
          {loading ? "Đang đăng..." : "Đăng bài"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
