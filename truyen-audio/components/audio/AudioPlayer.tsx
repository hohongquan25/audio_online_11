"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/utils";
import { saveProgress } from "@/app/actions/listening";
import { useAudio } from "./AudioContext";

interface AudioPlayerProps {
  episode: {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    story: { title: string; slug: string };
  };
  initialProgress?: number;
  isPreviewOnly?: boolean;
  isLoggedIn?: boolean;
  nextEpisode?: { 
    id: string; 
    title: string;
    audioUrl: string;
    duration: number;
  } | null;
  onClose?: () => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const PREVIEW_LIMIT = 300;
const SAVE_INTERVAL = 10_000;

export default function AudioPlayer({ episode, initialProgress = 0, isPreviewOnly = false, isLoggedIn = false, nextEpisode = null, onClose }: AudioPlayerProps) {
  const router = useRouter();
  const { play, state } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedRef = useRef<number>(initialProgress);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(episode.duration);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [previewLimitReached, setPreviewLimitReached] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [volume, setVolume] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes remaining
  const [showSleep, setShowSleep] = useState(false);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);
  const [hasTriedAutoClick, setHasTriedAutoClick] = useState(false);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  const doSaveProgress = useCallback(async (seconds: number) => {
    if (!isLoggedIn) return;
    const rounded = Math.floor(seconds);
    if (rounded === lastSavedRef.current) return;
    lastSavedRef.current = rounded;
    await saveProgress(episode.id, rounded);
  }, [isLoggedIn, episode.id]);

  const handleEnded = useCallback(() => { 
    setIsPlaying(false); 
    const a = audioRef.current; 
    if (a) doSaveProgress(a.currentTime);
    
    // Don't auto-play if in preview mode
    if (isPreviewOnly) return;
    
    // Auto-play next episode if available
    if (nextEpisode) {
      // Calculate the next-next episode from allEpisodes
      const allEps = state.allEpisodes;
      const currentIndex = allEps.findIndex(ep => ep.id === nextEpisode.id);
      const nextNextEp = currentIndex >= 0 && currentIndex < allEps.length - 1 ? allEps[currentIndex + 1] : null;
      
      // Check if next-next episode is accessible
      let nextNextEpisodeAccessible: { id: string; title: string; audioUrl: string; duration: number } | null = null;
      if (nextNextEp) {
        const canAccess = nextNextEp.isFreePreview || !state.storyIsVip || state.userIsVip;
        if (canAccess) {
          nextNextEpisodeAccessible = {
            id: nextNextEp.id,
            title: nextNextEp.title,
            audioUrl: nextNextEp.audioUrl,
            duration: nextNextEp.duration
          };
        }
      }
      
      // Play next episode directly without page navigation
      play(
        { 
          id: nextEpisode.id, 
          title: nextEpisode.title, 
          audioUrl: nextEpisode.audioUrl, 
          duration: nextEpisode.duration, 
          story: episode.story 
        },
        { 
          initialProgress: 0, 
          isPreviewOnly: false, 
          isLoggedIn,
          nextEpisode: nextNextEpisodeAccessible,
          allEpisodes: state.allEpisodes,
          storyIsVip: state.storyIsVip,
          userIsVip: state.userIsVip
        }
      );
    }
  }, [nextEpisode, play, episode.story, isLoggedIn, doSaveProgress, isPreviewOnly, state.allEpisodes, state.storyIsVip, state.userIsVip]);

  // Single unified flow: Auto-click play button for both mobile and desktop
  useEffect(() => {
    console.log('[AudioPlayer] Component mounted for episode:', episode.id);
    
    // Reset states for new episode
    setHasTriedAutoClick(false);
    setAutoPlayBlocked(false);
    setIsPlaying(false); // Important: Reset playing state
    
    // Pause and cleanup any previous audio
    const audio = audioRef.current;
    if (audio) {
      console.log('[AudioPlayer] Pausing previous audio');
      audio.pause();
      audio.currentTime = 0;
    }
    
    // Small delay to ensure button is rendered and audio is ready
    const timer = setTimeout(() => {
      if (playButtonRef.current && !hasTriedAutoClick) {
        console.log('[AudioPlayer] Triggering auto-click on play button');
        setHasTriedAutoClick(true);
        playButtonRef.current.click();
      }
    }, 150); // Slightly longer delay for cleanup
    
    return () => {
      clearTimeout(timer);
      // Cleanup: pause audio when component unmounts or episode changes
      const audio = audioRef.current;
      if (audio) {
        console.log('[AudioPlayer] Cleanup: pausing audio');
        audio.pause();
      }
    };
  }, [episode.id]);

  // Set initial progress when audio is ready
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log('[AudioPlayer] Setting up audio for episode:', episode.id);
    
    const setProgress = () => {
      if (initialProgress) {
        audio.currentTime = initialProgress;
        console.log('[AudioPlayer] Set currentTime to:', initialProgress);
      }
    };
    
    // Only load if src changed (audio element with key should handle this)
    // Don't call load() as it can cause AbortError when switching episodes quickly
    
    if (audio.readyState >= 2) {
      setProgress();
    } else {
      audio.addEventListener("loadeddata", setProgress, { once: true });
    }
    
    return () => {
      audio.removeEventListener("loadeddata", setProgress);
    };
  }, [episode.id, initialProgress]);

  useEffect(() => {
    if (isPlaying && isLoggedIn) {
      saveTimerRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio) doSaveProgress(audio.currentTime);
      }, SAVE_INTERVAL);
    }
    return () => { if (saveTimerRef.current) { clearInterval(saveTimerRef.current); saveTimerRef.current = null; } };
  }, [isPlaying, isLoggedIn, doSaveProgress]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const h = () => {
      const audio = audioRef.current;
      if (audio) navigator.sendBeacon("/api/listening-history", JSON.stringify({ episodeId: episode.id, progressSeconds: Math.floor(audio.currentTime) }));
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isLoggedIn, episode.id]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (isPreviewOnly && audio.currentTime >= PREVIEW_LIMIT) {
      audio.pause(); audio.currentTime = PREVIEW_LIMIT;
      setIsPlaying(false); setPreviewLimitReached(true);
    }
  };

  const handleLoadedMetadata = () => { const a = audioRef.current; if (a) setDuration(a.duration || episode.duration); };
  const togglePlay = () => {
    const a = audioRef.current; if (!a || previewLimitReached) return;
    if (isPlaying) { 
      a.pause(); 
      doSaveProgress(a.currentTime); 
    } else { 
      a.play()
        .then(() => {
          setAutoPlayBlocked(false);
        })
        .catch((err) => {
          // Handle AbortError when switching episodes quickly
          if (err.name === 'AbortError') {
            console.log('[AudioPlayer] Play aborted (likely switching episodes)');
          } else if (err.name === 'NotAllowedError') {
            console.log('[AudioPlayer] Play not allowed (autoplay policy)');
            setAutoPlayBlocked(true);
          } else {
            console.error('[AudioPlayer] Play failed:', err.name, err.message);
          }
        });
    }
    setIsPlaying(!isPlaying);
  };
  const handlePause = () => { setIsPlaying(false); const a = audioRef.current; if (a) doSaveProgress(a.currentTime); };
  const handlePlay = () => setIsPlaying(true);
  const skipForward = () => { const a = audioRef.current; if (!a) return; a.currentTime = Math.min(a.currentTime + 15, duration); };
  const skipBackward = () => { const a = audioRef.current; if (!a) return; a.currentTime = Math.max(a.currentTime - 15, 0); };
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current; if (!a) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
    if (isPreviewOnly) t = Math.min(t, PREVIEW_LIMIT);
    a.currentTime = t; setCurrentTime(t);
  };
  const changeRate = (r: number) => { const a = audioRef.current; if (a) a.playbackRate = r; setPlaybackRate(r); setShowSpeed(false); };
  const changeVolume = (v: number) => { const a = audioRef.current; if (a) a.volume = v; setVolume(v); };
  const toggleMute = () => { if (volume > 0) { changeVolume(0); } else { changeVolume(1); } };

  const startSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepTimer(minutes);
    setShowSleep(false);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current!);
          sleepTimerRef.current = null;
          const a = audioRef.current;
          if (a) { a.pause(); }
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 60_000);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) { clearInterval(sleepTimerRef.current); sleepTimerRef.current = null; }
    setSleepTimer(null);
    setShowSleep(false);
  };

  // Cleanup sleep timer on unmount
  useEffect(() => () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); }, []);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[#111] border-t border-[#333] w-full relative">
      <audio 
        key={episode.id}
        ref={audioRef} 
        src={episode.audioUrl} 
        preload="metadata" 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata} 
        onPause={handlePause} 
        onPlay={handlePlay} 
        onEnded={handleEnded} 
      />

      {/* Auto-play blocked overlay */}
      {autoPlayBlocked && (
        <div 
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 mb-3 mx-auto shadow-2xl">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-base font-medium text-white mb-1">Nhấn để phát</p>
            <p className="text-xs text-gray-400">Trình duyệt yêu cầu tương tác để phát nhạc</p>
          </div>
        </div>
      )}

      {/* Progress bar — full width thin line at top */}
      <div className="h-1 cursor-pointer bg-[#333] touch-manipulation" onClick={handleSeek} style={{ touchAction: 'manipulation' }}>
        <div className="h-full bg-purple-600 transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>

      {/* Mobile: Two rows layout */}
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-2 sm:hidden">
        {/* Row 1: Cover + info + close button */}
        <div className="flex min-w-0 items-center gap-3 mb-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[#222]">
            <div className="flex h-full w-full items-center justify-center text-lg">🎧</div>
          </div>
          <div className="min-w-0 flex-1 mr-2">
            <p className="truncate text-sm font-medium text-white">{episode.title}</p>
            <p className="truncate text-xs text-gray-500">
              {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
              {" · "}{episode.story.title}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:text-white hover:bg-[#222] transition"
              style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
              aria-label="Đóng player"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Row 2: Essential controls only */}
        <div className="flex items-center justify-center gap-2">
          {/* Speed */}
          <div className="relative">
            <button onClick={() => setShowSpeed(!showSpeed)} className="flex items-center justify-center rounded px-2 py-2 text-xs text-gray-400 hover:text-white min-w-[48px] min-h-[48px]" style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}>
              ⏱ {playbackRate}x
            </button>
            {showSpeed && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSpeed(false)} style={{ touchAction: 'manipulation', pointerEvents: 'auto' }} />
                {/* Modal */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xs rounded-xl border border-[#2a2a2a] bg-[#111] p-4 shadow-2xl z-50">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">⏱ Tốc độ phát</p>
                    <button 
                      onClick={() => setShowSpeed(false)}
                      className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-[#222] transition"
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                      aria-label="Đóng"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Speed options */}
                  <div className="grid grid-cols-3 gap-2">
                    {PLAYBACK_RATES.map((r) => (
                      <button key={r} onClick={() => changeRate(r)}
                        style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                        className={`rounded-lg py-2 text-sm font-medium transition ${r === playbackRate ? "bg-purple-600 text-white" : "bg-[#222] text-gray-300 hover:bg-[#333]"}`}>
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Skip back */}
          <button onClick={skipBackward} className="flex items-center justify-center rounded p-2 text-gray-400 hover:text-white active:text-purple-400 min-w-[48px] min-h-[48px]" style={{ WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)', touchAction: 'manipulation', pointerEvents: 'auto' }} aria-label="Tua lùi 15s">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button 
            ref={playButtonRef}
            onClick={togglePlay} 
            disabled={previewLimitReached}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 active:bg-purple-800" 
            style={{ WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.3)', touchAction: 'manipulation', pointerEvents: 'auto' }}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
            {isPlaying ? (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Skip forward */}
          <button onClick={skipForward} className="flex items-center justify-center rounded p-2 text-gray-400 hover:text-white active:text-purple-400 min-w-[48px] min-h-[48px]" style={{ WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)', touchAction: 'manipulation', pointerEvents: 'auto' }} aria-label="Tua tiến 15s">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Volume mute button only */}
          <button onClick={toggleMute} className="flex items-center justify-center rounded p-2 text-gray-400 hover:text-white min-w-[48px] min-h-[48px]" style={{ touchAction: 'manipulation', pointerEvents: 'auto' }} aria-label={volume === 0 ? "Bật âm" : "Tắt âm"}>
            {volume === 0 ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>

          {/* Sleep timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleep(!showSleep)}
              className={`flex items-center justify-center gap-1 rounded px-2 py-2 text-xs transition min-w-[48px] min-h-[48px] ${sleepTimer ? "text-purple-400" : "text-gray-400 hover:text-white"}`}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
              aria-label="Hẹn giờ tắt"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {sleepTimer && <span className="text-xs">{sleepTimer}p</span>}
            </button>
            {showSleep && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSleep(false)} style={{ touchAction: 'manipulation', pointerEvents: 'auto' }} />
                {/* Modal */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm rounded-xl border border-[#2a2a2a] bg-[#111] p-4 shadow-2xl z-50">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">⏰ Hẹn giờ tắt</p>
                    <button 
                      onClick={() => setShowSleep(false)}
                      className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-[#222] transition"
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                      aria-label="Đóng"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Preset buttons */}
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map(m => (
                      <button key={m} onClick={() => startSleepTimer(m)}
                        style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                        className={`rounded-lg py-2 text-sm font-medium transition ${sleepTimer === m ? "bg-purple-600 text-white" : "bg-[#222] text-gray-300 hover:bg-[#333]"}`}>
                        {m}p
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom input */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number" min="1" max="1440" placeholder="Tùy chỉnh (phút)"
                      className="flex-1 rounded-lg bg-[#222] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const v = Math.min(1440, Math.max(1, parseInt((e.target as HTMLInputElement).value) || 0));
                          if (v > 0) startSleepTimer(v);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Cancel button */}
                  {sleepTimer && (
                    <button onClick={cancelSleepTimer}
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                      className="w-full rounded-lg bg-red-900/30 py-2 text-sm text-red-400 hover:bg-red-900/50 transition">
                      Hủy ({sleepTimer}p còn lại)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Single row layout */}
      <div className="mx-auto hidden max-w-7xl items-center gap-2 sm:flex sm:gap-3 px-2 sm:px-6 lg:px-8 py-2">
        {/* Cover + info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[#222]">
            <div className="flex h-full w-full items-center justify-center text-lg">🎧</div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{episode.title}</p>
            <p className="truncate text-xs text-gray-500">
              {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
              {" · "}{episode.story.title}
            </p>
          </div>
        </div>

        {/* Controls — right side */}
        <div className="flex items-center gap-1">
          {/* Speed */}
          <div className="relative">
            <button onClick={() => setShowSpeed(!showSpeed)} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white" style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '44px', minHeight: '44px' }}>
              ⏱ {playbackRate}x
            </button>
            {showSpeed && (
              <div className="absolute bottom-full right-0 mb-1 rounded-lg border border-[#333] bg-[#1a1a1a] p-1 shadow-xl">
                {PLAYBACK_RATES.map((r) => (
                  <button key={r} onClick={() => changeRate(r)}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                    className={`block w-full rounded px-3 py-1 text-left text-xs ${r === playbackRate ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-[#333]"}`}>
                    {r}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Repeat placeholder */}
          <button className="rounded p-1.5 text-gray-500 hover:text-white" style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '44px', minHeight: '44px' }} aria-label="Lặp lại">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Skip back */}
          <button onClick={skipBackward} className="rounded p-2 text-gray-400 hover:text-white active:text-purple-400 touch-manipulation" style={{ WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)', touchAction: 'manipulation', minWidth: '44px', minHeight: '44px', pointerEvents: 'auto' }} aria-label="Tua lùi 15s">
            <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button onClick={togglePlay} disabled={previewLimitReached}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 active:bg-purple-800 touch-manipulation" 
            style={{ WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.3)', touchAction: 'manipulation', pointerEvents: 'auto' }}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
            {isPlaying ? (
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Skip forward */}
          <button onClick={skipForward} className="rounded p-2 text-gray-400 hover:text-white active:text-purple-400 touch-manipulation" style={{ WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)', touchAction: 'manipulation', minWidth: '44px', minHeight: '44px', pointerEvents: 'auto' }} aria-label="Tua tiến 15s">
            <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Volume with slider (desktop only) */}
          <div className="ml-2 flex items-center gap-1">
            <button onClick={toggleMute} className="rounded p-1 text-gray-400 hover:text-white" style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '44px', minHeight: '44px' }} aria-label={volume === 0 ? "Bật âm" : "Tắt âm"}>
              {volume === 0 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              )}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-[#444] accent-purple-600"
              style={{ 
                touchAction: 'manipulation', 
                pointerEvents: 'auto',
                WebkitAppearance: 'none'
              }}
              aria-label="Âm lượng" 
            />
          </div>

          {/* Sleep timer */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowSleep(!showSleep)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${sleepTimer ? "text-purple-400" : "text-gray-400 hover:text-white"}`}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '44px', minHeight: '44px' }}
              aria-label="Hẹn giờ tắt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {sleepTimer && <span>{sleepTimer}p</span>}
            </button>
            {showSleep && (
              <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl border border-[#2a2a2a] bg-[#111] p-3 shadow-2xl">
                <p className="mb-2 text-xs font-medium text-gray-400">⏰ Hẹn giờ tắt</p>

                {/* Preset buttons */}
                <div className="mb-3 grid grid-cols-4 gap-1">
                  {[15, 30, 45, 60].map(m => (
                    <button key={m} onClick={() => startSleepTimer(m)}
                      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                      className={`rounded-lg py-1.5 text-xs font-medium transition ${sleepTimer === m ? "bg-purple-600 text-white" : "bg-[#222] text-gray-300 hover:bg-[#333]"}`}>
                      {m}p
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number" min="1" max="1440" placeholder="Tùy chỉnh"
                    className="w-full rounded-lg bg-[#222] px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = Math.min(1440, Math.max(1, parseInt((e.target as HTMLInputElement).value) || 0));
                        if (v > 0) startSleepTimer(v);
                      }
                    }}
                  />
                  <span className="shrink-0 text-xs text-gray-500">phút</span>
                </div>

                {/* Cancel */}
                {sleepTimer && (
                  <button onClick={cancelSleepTimer}
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
                    className="mt-2 w-full rounded-lg bg-red-900/30 py-1.5 text-xs text-red-400 hover:bg-red-900/50">
                    Hủy ({sleepTimer}p còn lại)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Close button - Desktop only */}
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:text-white hover:bg-[#222] transition ml-2"
              style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
              aria-label="Đóng player"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {previewLimitReached && (
        <div className="bg-yellow-900/30 px-4 py-1 text-center text-xs text-yellow-300">
          Hết 5 phút xem trước. <a href="/login" className="underline">Đăng nhập</a> để tiếp tục.
        </div>
      )}
    </div>
  );
}
