"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Category { id: string; name: string; slug: string; emoji: string; }

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "free", label: "Miễn phí" },
  { value: "vip", label: "VIP" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến" },
] as const;

export default function StoryFilter({ total, categories = [] }: { total?: number; categories?: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all" || value === "newest") params.delete(key);
        else params.set(key, value);
      }
      if (params.get("page") === "1") params.delete("page");
      const qs = params.toString();
      router.push(qs ? `/stories?${qs}` : "/stories");
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchValue !== currentSearch) updateParams({ search: searchValue });
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchValue, currentSearch, updateParams]);

  return (
    <div className="mb-8 space-y-4">
      {/* Category tabs from DB */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => updateParams({ category: "all" })}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${currentCategory === "all" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25" : "border border-[#2a2a4a] bg-[#1a1a2e] text-gray-400 hover:border-purple-500/50 hover:text-white"}`}>
          Tất cả
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => updateParams({ category: cat.slug })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${currentCategory === cat.slug ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25" : "border border-[#2a2a4a] bg-[#1a1a2e] text-gray-400 hover:border-purple-500/50 hover:text-white"}`}>
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <select value={currentStatus} onChange={(e) => updateParams({ status: e.target.value })}
            className="rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={currentSort} onChange={(e) => updateParams({ sort: e.target.value })}
            className="rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sắp xếp: {o.label}</option>)}
          </select>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Tìm kiếm truyện..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] py-2 pl-10 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:border-purple-500 focus:outline-none" />
        </div>
      </div>

      {total !== undefined && (
        <p className="text-sm text-gray-500">Tìm thấy <span className="font-medium text-gray-300">{total}</span> bộ truyện</p>
      )}
    </div>
  );
}
