import Link from 'next/link';
import type { Video, ChannelKey } from '@/types';
import { CHANNELS } from '@/config/channels';
import { formatRelativeDate } from '@/lib/formatters';

interface VideoCardProps {
  video: Video;
  variant?: 'row' | 'grid' | 'featured' | 'compact';
  showChannel?: boolean;
  showCategory?: boolean;
  priority?: boolean;
}

export default function VideoCard({
  video,
  variant = 'grid',
  showChannel = true,
  priority = false,
}: VideoCardProps) {
  const channel = CHANNELS[video.channelKey as ChannelKey];
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Link
      href={`/video/${video.id}`}
      className={`group block ${isCompact ? 'flex gap-3' : ''}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 ${
          isCompact ? 'w-40 shrink-0' : 'w-full'
        } aspect-video`}
      >
        <img
          src={isFeatured ? video.thumbnailUrlHQ : video.thumbnailUrl}
          alt={video.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Duration badge */}
        {!video.isLive && !video.isUpcoming && video.durationFormatted && (
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
            {video.durationFormatted}
          </span>
        )}

        {/* LIVE badge */}
        {video.isLive && (
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-lg shadow-red-600/30">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        )}

        {/* Upcoming badge */}
        {video.isUpcoming && (
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-saffron-500 px-2 py-0.5 text-xs font-bold text-white">
            Upcoming
          </span>
        )}

        {/* Channel color accent — top-left dot */}
        <div
          className="absolute left-2 top-2 h-2 w-2 rounded-full shadow-sm"
          style={{ backgroundColor: channel.color }}
        />
      </div>

      {/* Meta */}
      <div className={`${isCompact ? 'flex-1 py-0.5' : 'mt-2'}`}>
        <h3
          className={`line-clamp-2 font-semibold leading-snug text-neutral-900 dark:text-neutral-100 ${
            isFeatured ? 'text-base md:text-lg' : 'text-[13px] md:text-sm'
          }`}
        >
          {video.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] text-neutral-500 dark:text-neutral-400">
          {showChannel && (
            <>
              <span className="font-medium text-neutral-600 dark:text-neutral-300">
                {channel.name}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">&middot;</span>
            </>
          )}
          <span>{video.viewCountFormatted} views</span>
          <span className="text-neutral-300 dark:text-neutral-600">&middot;</span>
          <span>{formatRelativeDate(video.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
