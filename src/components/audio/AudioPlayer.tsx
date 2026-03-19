'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageProvider';
import type { CmsAudioTrack } from '@/types';

interface AudioPlayerProps {
  tracks: CmsAudioTrack[];
}

export default function AudioPlayer({ tracks }: AudioPlayerProps) {
  const { language } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentIdx !== null ? tracks[currentIdx] : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => {
      setIsPlaying(false);
      if (currentIdx !== null && currentIdx < tracks.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
    };
  }, [currentIdx, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrack === null) return;
    audio.src = currentTrack.audioUrl;
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [currentIdx, currentTrack]);

  const playTrack = (idx: number) => {
    if (currentIdx === idx) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setCurrentIdx(idx);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + sec.toString().padStart(2, '0');
  };

  if (tracks.length === 0) return null;

  return (
    <div className="space-y-2">
      <audio ref={audioRef} muted={muted} preload="metadata" />

      {tracks.map((track, idx) => {
        const isActive = currentIdx === idx;
        const title = language === 'hi' && track.titleHi ? track.titleHi : track.title;
        const desc = language === 'hi' && track.descriptionHi ? track.descriptionHi : track.description;

        return (
          <div
            key={track.id}
            className={'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors cursor-pointer ' +
              (isActive
                ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
                : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-750')
            }
            onClick={() => playTrack(idx)}
          >
            <button
              className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ' +
                (isActive && isPlaying
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300')
              }
              onClick={(e) => { e.stopPropagation(); playTrack(idx); }}
            >
              {isActive && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className={'text-sm font-medium truncate ' +
                (isActive ? 'text-purple-900 dark:text-purple-200' : 'text-neutral-900 dark:text-white')
              }>
                {title}
              </p>
              {desc && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{desc}</p>
              )}
            </div>

            <span className="shrink-0 text-xs text-neutral-400">
              {track.duration || ''}
            </span>
          </div>
        );
      })}

      {currentTrack && (
        <div className="sticky bottom-16 md:bottom-0 rounded-xl border border-purple-200 bg-white/95 p-3 backdrop-blur-sm dark:border-purple-800 dark:bg-neutral-900/95">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white"
              onClick={() => currentIdx !== null && playTrack(currentIdx)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {language === 'hi' && currentTrack.titleHi ? currentTrack.titleHi : currentTrack.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-8">{formatTime(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={seek}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-purple-600 dark:bg-neutral-700"
                />
                <span className="text-[10px] text-neutral-400 w-8 text-right">{formatTime(duration)}</span>
              </div>
            </div>

            <button
              onClick={() => setMuted(!muted)}
              className="shrink-0 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
