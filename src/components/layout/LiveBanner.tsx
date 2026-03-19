'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Radio } from 'lucide-react';
import type { Video } from '@/types';

export default function LiveBanner() {
  const [liveVideo, setLiveVideo] = useState<Video | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function checkLive() {
      try {
        const res = await fetch('/api/videos/live');
        const data = await res.json();
        if (data.isLive && data.videos.length > 0) {
          setLiveVideo(data.videos[0]);
        }
      } catch {
        // Silently fail
      }
    }

    checkLive();
    const interval = setInterval(checkLive, 5 * 60 * 1000); // Check every 5 min
    return () => clearInterval(interval);
  }, []);

  if (!liveVideo || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-600 to-saffron-500 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6">
        <Link
          href={`/video/${liveVideo.id}`}
          className="flex flex-1 items-center gap-2 text-sm font-medium"
        >
          <Radio className="h-4 w-4 animate-pulse" />
          <span className="font-bold">LIVE NOW</span>
          <span className="hidden sm:inline">&mdash;</span>
          <span className="line-clamp-1">{liveVideo.title}</span>
          <span className="ml-2 shrink-0 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold">
            Watch Now
          </span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
