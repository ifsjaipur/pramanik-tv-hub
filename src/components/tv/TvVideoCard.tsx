import Link from 'next/link';
import type { Video, ChannelKey } from '@/types';
import { CHANNELS } from '@/config/channels';

interface TvVideoCardProps {
  video: Video;
  size?: 'normal' | 'large' | 'hero';
  priority?: boolean;
}

export default function TvVideoCard({ video, size = 'normal', priority = false }: TvVideoCardProps) {
  const channel = CHANNELS[video.channelKey as ChannelKey];

  const sizeClasses = {
    normal: 'w-[280px]',
    large: 'w-[340px]',
    hero: 'w-[480px]',
  };

  return (
    <Link
      href={`/video/${video.id}`}
      className={`tv-card block shrink-0 rounded-xl ${sizeClasses[size]}`}
      tabIndex={0}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-800">
        <img
          src={size === 'hero' ? video.thumbnailUrlHQ : video.thumbnailUrl}
          alt={video.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Duration badge */}
        {!video.isLive && !video.isUpcoming && video.durationFormatted && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium tabular-nums text-white">
            {video.durationFormatted}
          </span>
        )}

        {/* LIVE badge */}
        {video.isLive && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-sm font-bold text-white shadow-lg shadow-red-600/30">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        )}

        {/* Channel dot */}
        <div
          className="absolute left-2.5 top-2.5 h-2.5 w-2.5 rounded-full shadow"
          style={{ backgroundColor: channel.color }}
        />

        {/* Title overlay at bottom for hero cards */}
        {size === 'hero' && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="line-clamp-2 text-lg font-bold text-white drop-shadow-lg">
              {video.title}
            </h3>
            <p className="mt-1 text-sm text-white/70">{channel.name}</p>
          </div>
        )}
      </div>

      {/* Meta — shown for normal and large cards */}
      {size !== 'hero' && (
        <div className="mt-2 px-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-100">
            {video.title}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            {channel.name}
          </p>
        </div>
      )}
    </Link>
  );
}
