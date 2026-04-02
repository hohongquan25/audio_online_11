"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TYPES = [
  { value: "all", label: "Tất cả" },
  { value: "general", label: "💬 Thảo luận" },
  { value: "feedback", label: "💡 Góp ý" },
  { value: "bug", label: "🐛 Báo lỗi" },
];

export default function CommunityFilter({ currentType, total }: { currentType: string; total: number }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPES.map(t => (
          <Link key={t.value} href={t.value === "all" ? "/community" : `/community?type=${t.value}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${currentType === t.value ? "bg-purple-600 text-white" : "border border-[#2a2a4a] text-gray-400 hover:text-white"}`}>
            {t.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-600">{total} bài viết</p>
    </div>
  );
}
