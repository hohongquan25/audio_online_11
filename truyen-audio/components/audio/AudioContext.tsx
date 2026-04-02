"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface EpisodeData {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  story: { title: string; slug: string };
}

interface AudioState {
  episode: EpisodeData | null;
  initialProgress: number;
  isPreviewOnly: boolean;
  isLoggedIn: boolean;
}

interface AudioContextType {
  state: AudioState;
  play: (episode: EpisodeData, opts?: { initialProgress?: number; isPreviewOnly?: boolean; isLoggedIn?: boolean }) => void;
  stop: () => void;
}

const AudioCtx = createContext<AudioContextType>({
  state: { episode: null, initialProgress: 0, isPreviewOnly: false, isLoggedIn: false },
  play: () => {},
  stop: () => {},
});

export function useAudio() {
  return useContext(AudioCtx);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioState>({
    episode: null,
    initialProgress: 0,
    isPreviewOnly: false,
    isLoggedIn: false,
  });

  function play(episode: EpisodeData, opts?: { initialProgress?: number; isPreviewOnly?: boolean; isLoggedIn?: boolean }) {
    setState({
      episode,
      initialProgress: opts?.initialProgress ?? 0,
      isPreviewOnly: opts?.isPreviewOnly ?? false,
      isLoggedIn: opts?.isLoggedIn ?? false,
    });
  }

  function stop() {
    setState({ episode: null, initialProgress: 0, isPreviewOnly: false, isLoggedIn: false });
  }

  return (
    <AudioCtx.Provider value={{ state, play, stop }}>
      {children}
    </AudioCtx.Provider>
  );
}
