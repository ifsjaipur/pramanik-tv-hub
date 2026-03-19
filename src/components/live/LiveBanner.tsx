'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Clock } from 'lucide-react';

interface LiveVideo {
  id: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
}

interface LiveData {
  videos: LiveVideo[];
  upcoming: LiveVideo[];
  isLive: boolean;
  hasUpcoming: boolean;
}

export default function LiveBanner() {
  const [data, setData] = useState<LiveData | null>(null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/videos/live');
        if (res.ok && mounted) {
          const json = await res.json();
          setData(json);
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 3 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (!data || (!data.isLive && !data.hasUpcoming)) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-3 md:px-6">
      {data.isLive && data.videos.map((v) => (
        <Link
          key={v.id}
          href={`/video/${v.id}`}
          className="mb-2 flex items-center gap-3 rounded-xl bg-red-600 px-4 py-3 text-white shadow-lg shadow-red-600/20 transition-transform hover:scale-[1.01]"
        >
          <Radio className="h-5 w-5 shrink-0 animate-pulse" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide">Live Now</p>
            <p className="truncate text-sm font-medium">{v.title}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            Watch
          </span>
        </Link>
      ))}

      {data.hasUpcoming && data.upcoming.map((v) => (
        <Link
          key={v.id}
          href={`/video/${v.id}`}
          className="mb-2 flex items-center gap-3 rounded-xl bg-saffron-500 px-4 py-3 text-white shadow-lg shadow-saffron-500/20 transition-transform hover:scale-[1.01]"
        >
          <Clock className="h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide">Upcoming</p>
            <p className="truncate text-sm font-medium">{v.title}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            {v.channelName}
          </span>
        </Link>
      ))}
    </div>
  );
}
