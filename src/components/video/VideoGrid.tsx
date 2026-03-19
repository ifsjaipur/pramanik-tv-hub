import type { Video } from '@/types';
import VideoCard from './VideoCard';
import VideoCardSkeleton from './VideoCardSkeleton';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  showChannel?: boolean;
}

export default function VideoGrid({ videos, loading = false, showChannel = true }: VideoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 md:px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-500 dark:text-neutral-400">
        No videos found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 md:px-6">
      {videos.map((video, i) => (
        <VideoCard
          key={video.id}
          video={video}
          showChannel={showChannel}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
