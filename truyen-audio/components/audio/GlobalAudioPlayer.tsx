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
            onClose={stop}
          />
        </div>
      </div>
    </>
  );
}
