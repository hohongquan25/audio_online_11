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
  nextEpisode: { id: string; title: string; audioUrl: string; duration: number } | null;
  allEpisodes: Array<{ id: string; title: string; audioUrl: string; duration: number; order: number; isFreePreview: boolean }>;
  storyIsVip: boolean;
  userIsVip: boolean;
  shouldAutoPlay: boolean; // Flag to indicate user initiated play
}

interface AudioContextType {
  state: AudioState;
  play: (episode: EpisodeData, opts?: { 
    initialProgress?: number; 
    isPreviewOnly?: boolean; 
    isLoggedIn?: boolean; 
    nextEpisode?: { id: string; title: string; audioUrl: string; duration: number } | null;
    allEpisodes?: Array<{ id: string; title: string; audioUrl: string; duration: number; order: number; isFreePreview: boolean }>;
    storyIsVip?: boolean;
    userIsVip?: boolean;
  }) => void;
  stop: () => void;
}

const AudioCtx = createContext<AudioContextType>({
  state: { episode: null, initialProgress: 0, isPreviewOnly: false, isLoggedIn: false, nextEpisode: null, allEpisodes: [], storyIsVip: false, userIsVip: false, shouldAutoPlay: false },
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
    nextEpisode: null,
    allEpisodes: [],
    storyIsVip: false,
    userIsVip: false,
    shouldAutoPlay: false,
  });

  function play(episode: EpisodeData, opts?: { 
    initialProgress?: number; 
    isPreviewOnly?: boolean; 
    isLoggedIn?: boolean; 
    nextEpisode?: { id: string; title: string; audioUrl: string; duration: number } | null;
    allEpisodes?: Array<{ id: string; title: string; audioUrl: string; duration: number; order: number; isFreePreview: boolean }>;
    storyIsVip?: boolean;
    userIsVip?: boolean;
  }) {
    console.log('[AudioContext] play() called');
    console.log('[AudioContext] Episode:', episode.id, episode.title);
    console.log('[AudioContext] Audio URL:', episode.audioUrl);
    console.log('[AudioContext] Options:', opts);
    
    setState({
      episode,
      initialProgress: opts?.initialProgress ?? 0,
      isPreviewOnly: opts?.isPreviewOnly ?? false,
      isLoggedIn: opts?.isLoggedIn ?? false,
      nextEpisode: opts?.nextEpisode ?? null,
      allEpisodes: opts?.allEpisodes ?? [],
      storyIsVip: opts?.storyIsVip ?? false,
      userIsVip: opts?.userIsVip ?? false,
      shouldAutoPlay: true, // Always try to auto-play when user clicks
    });
    
    console.log('[AudioContext] State updated, AudioPlayer should mount/update');
  }

  function stop() {
    setState({ episode: null, initialProgress: 0, isPreviewOnly: false, isLoggedIn: false, nextEpisode: null, allEpisodes: [], storyIsVip: false, userIsVip: false, shouldAutoPlay: false });
  }

  return (
    <AudioCtx.Provider value={{ state, play, stop }}>
      {children}
    </AudioCtx.Provider>
  );
}
