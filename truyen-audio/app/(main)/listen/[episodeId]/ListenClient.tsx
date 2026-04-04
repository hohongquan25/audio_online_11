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
  nextEpisode: { id: string; title: string; audioUrl: string; duration: number } | null;
}

export default function ListenClient({ episode, initialProgress, isPreviewOnly, isLoggedIn, nextEpisode }: Props) {
  const { play, state } = useAudio();

  useEffect(() => {
    // Always update when episode changes
    play(episode, { initialProgress, isPreviewOnly, isLoggedIn, nextEpisode });
  }, [episode.id, nextEpisode]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
