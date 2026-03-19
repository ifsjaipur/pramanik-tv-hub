'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Video } from '@/types';
import VideoGrid from '@/components/video/VideoGrid';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setVideos([]);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data.videos ?? []);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <p className="text-lg">Search for videos</p>
        <p className="mt-1 text-sm">Try &ldquo;bhawna yog&rdquo; or &ldquo;pravachan&rdquo;</p>
      </div>
    );
  }

  return (
    <div>
      {!loading && videos.length > 0 && (
        <p className="mb-4 px-4 text-sm text-neutral-500 dark:text-neutral-400 md:px-6">
          {videos.length} results for &ldquo;{query}&rdquo;
        </p>
      )}
      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
}
