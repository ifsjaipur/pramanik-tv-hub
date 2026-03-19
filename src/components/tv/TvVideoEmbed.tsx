'use client';

import { getYoutubeEmbedUrl } from '@/lib/formatters';

interface TvVideoEmbedProps {
  videoId: string;
  title?: string;
}

export default function TvVideoEmbed({ videoId, title = 'Video' }: TvVideoEmbedProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={`${getYoutubeEmbedUrl(videoId)}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        tabIndex={0}
      />
    </div>
  );
}
