'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface TvVideoEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
}

export default function TvVideoEmbed({ videoId, title = 'Video', autoplay = true }: TvVideoEmbedProps) {
  const [playing, setPlaying] = useState(autoplay);

  // Show thumbnail with play button until user interacts (or autoplay on video page)
  if (!playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <button
          onClick={() => setPlaying(true)}
          className="tv-card absolute inset-0 flex items-center justify-center bg-black/30"
          tabIndex={0}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-2xl">
            <Play className="h-10 w-10 fill-black text-black ml-1" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        tabIndex={0}
        loading="eager"
      />
    </div>
  );
}
