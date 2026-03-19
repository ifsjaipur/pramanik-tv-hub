'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Video } from '@/types';
import VideoCard from './VideoCard';

interface CollapsiblePlaylistProps {
  title: string;
  videos: Video[];
  thumbnailUrl?: string;
}

export default function CollapsiblePlaylist({ title, videos, thumbnailUrl }: CollapsiblePlaylistProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className='rounded-xl border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-800'>
      <button
        onClick={() => setOpen(!open)}
        className='flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className='h-16 w-28 shrink-0 rounded-lg object-cover sm:h-20 sm:w-36'
          />
        )}
        <div className='min-w-0 flex-1'>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2'>
            {title}
          </h3>
          <p className='mt-0.5 text-xs text-neutral-500'>{videos.length} videos</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='border-t border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50'>
          <div className='scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2'>
            {videos.map((video) => (
              <div
                key={video.id}
                className='w-[160px] shrink-0 snap-start sm:w-[200px] md:w-[240px]'
              >
                <VideoCard video={video} variant='row' />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
