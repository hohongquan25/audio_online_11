"use client";

import { useEffect } from "react";
import { useAudio } from "@/components/audio/AudioContext";

interface Props {
  episode: {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    story: { title: string; slug: string };
  };
  initialProgress: number;
  isPreviewOnly: boolean;
  isLoggedIn: boolean;
}

export default function ListenClient({ episode, initialProgress, isPreviewOnly, isLoggedIn }: Props) {
  const { play, state } = useAudio();

  useEffect(() => {
    // Auto-play when page loads, but only if not already playing this episode
    if (state.episode?.id !== episode.id) {
      play(episode, { initialProgress, isPreviewOnly, isLoggedIn });
    }
  }, [episode.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
