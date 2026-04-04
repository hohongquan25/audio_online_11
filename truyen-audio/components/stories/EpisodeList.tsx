"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { formatDuration } from "@/lib/utils";
import { useAudio } from "@/components/audio/AudioContext";

interface Episode {
  id: string;
  title: string;
  order: number;
  duration: number;
  isFreePreview: boolean;
  audioUrl?: string;
}

interface EpisodeListProps {
  episodes: Episode[];
  userRole: "USER" | "VIP" | "ADMIN" | null;
  storyIsVip: boolean;
  storyTitle?: string;
  storySlug?: string;
  coverImage?: string;
}

export default function EpisodeList({ episodes, userRole, storyIsVip, storyTitle, storySlug, coverImage }: EpisodeListProps) {
  const [modalType, setModalType] = useState<"login" | "vip" | null>(null);
  const { play, state } = useAudio();
  const router = useRouter();

  const isLoggedIn = userRole !== null;
  const isVip = userRole === "VIP" || userRole === "ADMIN";

  function canPlay(episode: Episode): boolean {
    if (episode.isFreePreview) return true;
    if (!storyIsVip) return true;
    if (isVip) return true;
    return false;
  }

  function handlePlay(episode: Episode) {
    if (!canPlay(episode)) {
      if (!isLoggedIn) setModalType("login");
      else setModalType("vip");
      return;
    }
    
    if (episode.audioUrl && storyTitle && storySlug) {
      // Find next episode
      const currentIndex = episodes.findIndex(ep => ep.id === episode.id);
      const nextEp = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
      
      // Check if next episode is accessible
      let nextEpisodeAccessible: { id: string; title: string; audioUrl: string; duration: number } | null = null;
      if (nextEp && canPlay(nextEp) && nextEp.audioUrl) {
        nextEpisodeAccessible = {
          id: nextEp.id,
          title: nextEp.title,
          audioUrl: nextEp.audioUrl,
          duration: nextEp.duration
        };
      }
      
      // Prepare allEpisodes with order info
      const allEpisodesWithOrder = episodes.map(ep => ({
        id: ep.id,
        title: ep.title,
        audioUrl: ep.audioUrl || '',
        duration: ep.duration,
        order: ep.order,
        isFreePreview: ep.isFreePreview
      }));
      
      play(
        { id: episode.id, title: episode.title, audioUrl: episode.audioUrl, duration: episode.duration, story: { title: storyTitle, slug: storySlug } },
        { 
          isPreviewOnly: !isLoggedIn && episode.isFreePreview, 
          isLoggedIn, 
          nextEpisode: nextEpisodeAccessible,
          allEpisodes: allEpisodesWithOrder,
          storyIsVip: storyIsVip,
          userIsVip: isVip
        }
      );
    } else {
      router.push(`/listen/${episode.id}`);
    }
  }

  if (episodes.length === 0) return <p className="text-sm text-gray-500">Chưa có tập nào.</p>;

  return (
    <>
      <ul className="space-y-1">
        {episodes.map((episode) => {
          const playable = canPlay(episode);
          const isCurrentlyPlaying = state.episode?.id === episode.id;

          return (
            <li key={episode.id}>
              <button
                type="button"
                onClick={() => handlePlay(episode)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isCurrentlyPlaying
                    ? "bg-purple-600/10 border border-purple-600/30"
                    : "hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1a1a2e]">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-600">🎧</div>
                  )}
                  {/* Overlay on hover or playing */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isCurrentlyPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100 bg-black/50"}`}>
                    {isCurrentlyPlaying ? (
                      /* Equalizer animation */
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-purple-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "60%", animationDelay: "0ms" }} />
                        <span className="w-1 bg-purple-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "100%", animationDelay: "150ms" }} />
                        <span className="w-1 bg-purple-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "40%", animationDelay: "300ms" }} />
                        <span className="w-1 bg-purple-600 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "80%", animationDelay: "100ms" }} />
                      </div>
                    ) : (
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isCurrentlyPlaying ? "text-purple-400" : "text-gray-200 group-hover:text-white"}`}>
                    {episode.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                    <span>⏱ {formatDuration(episode.duration)}</span>
                    {!playable && <span className="text-yellow-600">🔒 VIP</span>}
                    {episode.isFreePreview && <span className="text-green-600">Miễn phí</span>}
                  </div>
                </div>

                {/* Right icon */}
                <div className="shrink-0">
                  {!playable ? (
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : isCurrentlyPlaying ? (
                    <span className="text-xs font-medium text-purple-400">Đang phát</span>
                  ) : (
                    <svg className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Modal isOpen={modalType === "login"} onClose={() => setModalType(null)} title="Yêu cầu đăng nhập">
        <p className="mb-4 text-sm text-gray-400">Vui lòng đăng nhập để nghe tập này.</p>
        <Link href="/login" className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">Đăng nhập</Link>
      </Modal>

      <Modal isOpen={modalType === "vip"} onClose={() => setModalType(null)} title="Nâng cấp VIP">
        <p className="mb-4 text-sm text-gray-400">Nâng cấp VIP để nghe tất cả các tập truyện.</p>
        <Link href="/vip" className="inline-block rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">Nâng cấp VIP</Link>
      </Modal>
    </>
  );
}
