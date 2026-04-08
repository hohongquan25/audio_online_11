"use client";

import { useAudio } from "./AudioContext";
import AudioPlayer from "./AudioPlayer";

export default function GlobalAudioPlayer() {
  const { state, stop } = useAudio();

  if (!state.episode) return null;

  return (
    <>
      <div className="h-16" />
      <div className="fixed bottom-0 left-0 right-0 z-[70]" style={{ pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <AudioPlayer
            key={state.episode.id}
            episode={state.episode}
            initialProgress={state.initialProgress}
            isPreviewOnly={state.isPreviewOnly}
            isLoggedIn={state.isLoggedIn}
            nextEpisode={state.nextEpisode}
          />
          <button
            onClick={stop}
            className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:text-white"
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '44px', minHeight: '44px' }}
            aria-label="Đóng player"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
