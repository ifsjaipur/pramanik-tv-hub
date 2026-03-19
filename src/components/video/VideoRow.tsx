import Link from 'next/link';
import type { Video } from '@/types';
import VideoCard from './VideoCard';
import { ChevronRight } from 'lucide-react';

interface VideoRowProps {
  title: string;
  titleHi?: string;
  videos: Video[];
  viewAllUrl?: string;
  priority?: boolean;
}

export default function VideoRow({ title, titleHi, videos, viewAllUrl, priority = false }: VideoRowProps) {
  if (videos.length === 0) return null;

  return (
    <section className="py-3 md:py-4">
      {/* Row header */}
      <div className="mb-2.5 flex items-baseline justify-between px-4 md:px-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 md:text-xl">
            {title}
          </h2>
          {titleHi && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {titleHi}
            </p>
          )}
        </div>
        {viewAllUrl && (
          <Link
            href={viewAllUrl}
            className="flex shrink-0 items-center gap-0.5 rounded-full border border-saffron-400/30 bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-600 transition-colors hover:bg-saffron-100 dark:border-saffron-500/20 dark:bg-saffron-500/10 dark:text-saffron-400 dark:hover:bg-saffron-500/20"
          >
            View All
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:gap-4 md:px-6">
        {videos.map((video, i) => (
          <div
            key={video.id}
            className="w-[160px] shrink-0 snap-start sm:w-[200px] md:w-[240px] lg:w-[260px]"
          >
            <VideoCard
              video={video}
              variant="row"
              priority={priority && i < 3}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
