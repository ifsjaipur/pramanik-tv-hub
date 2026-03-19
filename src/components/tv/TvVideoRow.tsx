import Link from 'next/link';
import type { Video } from '@/types';
import TvVideoCard from './TvVideoCard';
import { ChevronRight } from 'lucide-react';

interface TvVideoRowProps {
  title: string;
  titleHi?: string;
  videos: Video[];
  viewAllUrl?: string;
  priority?: boolean;
  cardSize?: 'normal' | 'large' | 'hero';
}

export default function TvVideoRow({
  title,
  titleHi,
  videos,
  viewAllUrl,
  priority = false,
  cardSize = 'normal',
}: TvVideoRowProps) {
  if (videos.length === 0) return null;

  return (
    <section className="py-4">
      {/* Row header */}
      <div className="mb-3 flex items-baseline justify-between px-8">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">
            {title}
          </h2>
          {titleHi && (
            <p className="text-sm text-neutral-500">{titleHi}</p>
          )}
        </div>
        {viewAllUrl && (
          <Link
            href={viewAllUrl}
            className="tv-focusable flex items-center gap-1 rounded-full border border-saffron-400/30 bg-saffron-500/10 px-4 py-1.5 text-sm font-semibold text-saffron-400"
            tabIndex={0}
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll row */}
      <div className="tv-row scrollbar-hide flex gap-4 overflow-x-auto px-8 pb-2">
        {videos.map((video, i) => (
          <TvVideoCard
            key={video.id}
            video={video}
            size={cardSize}
            priority={priority && i < 4}
          />
        ))}
      </div>
    </section>
  );
}
