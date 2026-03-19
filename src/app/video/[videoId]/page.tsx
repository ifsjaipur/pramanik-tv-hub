import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVideoById, getRelatedVideos } from '@/lib/youtube';
import TvVideoRow from '@/components/tv/TvVideoRow';
import TvVideoEmbed from '@/components/tv/TvVideoEmbed';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ videoId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideoById(videoId);
  if (!video) return { title: 'Video Not Found' };
  return { title: video.title };
}

export default async function VideoPage({ params }: PageProps) {
  const { videoId } = await params;
  const video = await getVideoById(videoId);
  if (!video) notFound();

  const related = await getRelatedVideos(video, 12);

  return (
    <div className="py-4">
      {/* Full-width video embed */}
      <div className="px-8">
        <TvVideoEmbed videoId={video.id} title={video.title} />
      </div>

      {/* Video title and minimal info */}
      <div className="px-8 pt-4">
        <h1 className="text-2xl font-bold text-white">
          {video.title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
          <span>{video.viewCountFormatted} views</span>
          {video.durationFormatted && <span>{video.durationFormatted}</span>}
        </div>
      </div>

      {/* Related videos */}
      {related.length > 0 && (
        <div className="mt-6">
          <TvVideoRow
            title="Related Videos"
            videos={related}
          />
        </div>
      )}
    </div>
  );
}
