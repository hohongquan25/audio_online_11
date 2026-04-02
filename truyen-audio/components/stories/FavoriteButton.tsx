"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/actions/favorites";

export default function FavoriteButton({ storyId, initialFavorite, isLoggedIn }: {
  storyId: string; initialFavorite: boolean; isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) { router.push("/login"); return; }
    setLoading(true);
    const result = await toggleFavorite(storyId);
    if (result.success && result.isFavorite !== undefined) setIsFav(result.isFavorite);
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
        isFav
          ? "border-purple-600/50 bg-purple-600/10 text-purple-400"
          : "border-[#2a2a4a] bg-[#1a1a2e] text-gray-300 hover:border-purple-600/50 hover:text-purple-400"
      }`}>
      <svg className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {isFav ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
