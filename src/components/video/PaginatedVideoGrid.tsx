'use client';

import { useState } from 'react';
import type { Video } from '@/types';
import VideoCard from './VideoCard';
import { ChevronDown } from 'lucide-react';

interface PaginatedVideoGridProps {
  videos: Video[];
  pageSize?: number;
  showChannel?: boolean;
}

export default function PaginatedVideoGrid({
  videos,
  pageSize = 24,
  showChannel = true,
}: PaginatedVideoGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-500 dark:text-neutral-400">
        No videos found
      </div>
    );
  }

  const visibleVideos = videos.slice(0, visibleCount);
  const hasMore = visibleCount < videos.length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 md:px-6">
        {visibleVideos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            showChannel={showChannel}
            priority={i < 4}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center px-4">
          <button
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="flex items-center gap-2 rounded-full bg-saffron-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-saffron-600 hover:shadow-xl active:scale-95"
          >
            Load More
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="ml-3 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            {visibleCount} of {videos.length}
          </span>
        </div>
      )}
    </div>
  );
}
