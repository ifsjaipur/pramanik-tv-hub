import { getPlaylistVideos } from '@/lib/youtube';
import { getPlaylistTags } from '@/lib/cms';
import VideoRow from '@/components/video/VideoRow';
import Link from 'next/link';
import type { ChannelKey } from '@/types';
import { ChevronRight } from 'lucide-react';

export default async function SwadhyayDetailPage({ params }: { params: Promise<{ playlistId: string }> }) {
  const { playlistId } = await params;
  const allTags = await getPlaylistTags();
  const tag = allTags.find((t) => t.playlistId === playlistId);
  const title = tag?.playlistTitle || 'Swadhyay Series';
  const channelKey = (tag?.channelKey || 'pramansagarji') as ChannelKey;

  const videos = await getPlaylistVideos(playlistId, channelKey, title, 200);

  return (
    <div className="pb-20 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <nav className="mb-4 flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/swadhyay" className="hover:text-saffron-500">Swadhyay</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-neutral-900 dark:text-white">{title}</span>
        </nav>
        <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">{title}</h1>
      </div>

      <div className="mx-auto max-w-7xl space-y-1">
        <VideoRow title={title} videos={videos} />
      </div>
    </div>
  );
}
