"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { formatDuration } from "@/lib/utils";
import { saveProgress } from "@/app/actions/listening";

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
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const PREVIEW_LIMIT = 300;
const SAVE_INTERVAL = 10_000;

export default function AudioPlayer({ episode, initialProgress = 0, isPreviewOnly = false, isLoggedIn = false }: AudioPlayerProps) {
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
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doSaveProgress = useCallback(async (seconds: number) => {
    if (!isLoggedIn) return;
    const rounded = Math.floor(seconds);
    if (rounded === lastSavedRef.current) return;
    lastSavedRef.current = rounded;
    await saveProgress(episode.id, rounded);
  }, [isLoggedIn, episode.id]);

  // Auto-seek to saved position and auto-play on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const h = () => {
      if (initialProgress) audio.currentTime = initialProgress;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    };
    audio.addEventListener("canplay", h, { once: true });
    return () => audio.removeEventListener("canplay", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id]);

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
    if (isPlaying) { a.pause(); doSaveProgress(a.currentTime); } else { a.play(); }
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
  const handleEnded = () => { setIsPlaying(false); const a = audioRef.current; if (a) doSaveProgress(a.currentTime); };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[#111] border-t border-[#333]">
      <audio ref={audioRef} src={episode.audioUrl} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPause={handlePause} onPlay={handlePlay} onEnded={handleEnded} />

      {/* Progress bar — full width thin line at top */}
      <div className="h-1 cursor-pointer bg-[#333]" onClick={handleSeek}>
        <div className="h-full bg-purple-600 transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>

      {/* Single row player */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        {/* Cover + info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[#222]">
            <div className="flex h-full w-full items-center justify-center text-lg">🎧</div>
          </div>
          <div className="min-w-0">
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
            <button onClick={() => setShowSpeed(!showSpeed)} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white">
              ⏱ {playbackRate}x
            </button>
            {showSpeed && (
              <div className="absolute bottom-full right-0 mb-1 rounded-lg border border-[#333] bg-[#1a1a1a] p-1 shadow-xl">
                {PLAYBACK_RATES.map((r) => (
                  <button key={r} onClick={() => changeRate(r)}
                    className={`block w-full rounded px-3 py-1 text-left text-xs ${r === playbackRate ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-[#333]"}`}>
                    {r}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Repeat placeholder */}
          <button className="rounded p-1.5 text-gray-500 hover:text-white" aria-label="Lặp lại">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Skip back */}
          <button onClick={skipBackward} className="rounded p-1.5 text-gray-400 hover:text-white" aria-label="Tua lùi 15s">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button onClick={togglePlay} disabled={previewLimitReached}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50" aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
            {isPlaying ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Skip forward */}
          <button onClick={skipForward} className="rounded p-1.5 text-gray-400 hover:text-white" aria-label="Tua tiến 15s">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Volume */}
          <div className="ml-2 flex items-center gap-1">
            <button onClick={toggleMute} className="rounded p-1 text-gray-400 hover:text-white" aria-label={volume === 0 ? "Bật âm" : "Tắt âm"}>
              {volume === 0 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              )}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-[#444] accent-purple-600"
              aria-label="Âm lượng" />
          </div>

          {/* Sleep timer */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowSleep(!showSleep)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${sleepTimer ? "text-purple-400" : "text-gray-400 hover:text-white"}`}
              aria-label="Hẹn giờ tắt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                    className="mt-2 w-full rounded-lg bg-red-900/30 py-1.5 text-xs text-red-400 hover:bg-red-900/50">
                    Hủy ({sleepTimer}p còn lại)
                  </button>
                )}
              </div>
            )}
          </div>
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
