"use client";

import { useState } from "react";
import Link from "next/link";
import { useAudio } from "@/components/audio/AudioContext";
import Modal from "@/components/ui/Modal";

interface Episode {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  isFreePreview: boolean;
}

interface Props {
  firstEpisode: Episode | null;
  storyTitle: string;
  storySlug: string;
  storyIsVip: boolean;
  userRole: "USER" | "VIP" | "ADMIN" | null;
}

export default function PlayFirstEpisodeButton({ firstEpisode, storyTitle, storySlug, storyIsVip, userRole }: Props) {
  const { play } = useAudio();
  const [showVipModal, setShowVipModal] = useState(false);

  if (!firstEpisode) return null;

  const isLoggedIn = userRole !== null;
  const isVip = userRole === "VIP" || userRole === "ADMIN";

  // Can play if: free preview OR story is not VIP OR user is VIP
  const canPlay = firstEpisode.isFreePreview || !storyIsVip || isVip;

  // Store episode data to avoid null reference issues
  const episodeData = {
    id: firstEpisode.id,
    title: firstEpisode.title,
    audioUrl: firstEpisode.audioUrl,
    duration: firstEpisode.duration,
    isFreePreview: firstEpisode.isFreePreview
  };

  // Mobile-friendly event handler
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canPlay) {
      setShowVipModal(true);
      return;
    }

    play(
      { id: episodeData.id, title: episodeData.title, audioUrl: episodeData.audioUrl, duration: episodeData.duration, story: { title: storyTitle, slug: storySlug } },
      { isPreviewOnly: !isLoggedIn && episodeData.isFreePreview, isLoggedIn }
    );
  };

  return (
    <>
      <button
        onClick={handleInteraction}
        onTouchEnd={handleInteraction}
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
        className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700 active:scale-95 transition-transform"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}><path d="M8 5v14l11-7z" /></svg>
        Nghe thử
      </button>

      {/* VIP required modal */}
      <Modal isOpen={showVipModal} onClose={() => setShowVipModal(false)} title="Yêu cầu VIP">
        <p className="mb-4 text-sm text-gray-400">
          Truyện này yêu cầu gói VIP để nghe. Nâng cấp ngay để trải nghiệm không giới hạn.
        </p>
        <div className="flex gap-3">
          <Link 
            href="/vip" 
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} 
            className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 active:scale-95 transition-transform">
            Xem gói VIP
          </Link>
          {!isLoggedIn && (
            <Link 
              href="/login" 
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} 
              className="inline-block rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm font-medium text-gray-300 hover:text-white active:scale-95 transition-transform">
              Đăng nhập
            </Link>
          )}
        </div>
      </Modal>
    </>
  );
}
