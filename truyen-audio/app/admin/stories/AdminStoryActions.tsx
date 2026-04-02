"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleStoryActive, deleteStory } from "@/app/actions/stories";

export default function AdminStoryActions({ storyId, isActive, slug }: { storyId: string; isActive: boolean; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleStoryActive(storyId);
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Bạn có chắc muốn xóa truyện này? Tất cả tập sẽ bị xóa theo.")) return;
    setLoading(true);
    await deleteStory(storyId);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Link href={`/admin/stories/edit/${storyId}`} className="text-xs text-blue-400 hover:text-blue-300">Sửa</Link>
      <button onClick={handleToggle} disabled={loading} className={`text-xs ${isActive ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"} disabled:opacity-50`}>
        {isActive ? "Tắt" : "Bật"}
      </button>
      <button onClick={handleDelete} disabled={loading} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Xóa</button>
    </div>
  );
}
