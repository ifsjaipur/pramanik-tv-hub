import { getPlaylistsForTab } from '@/lib/content-tabs';
import { getArticlesBySection, getAudioTracksBySection, getPageLayout } from '@/lib/cms';
import VideoRow from '@/components/video/VideoRow';
import BhawnaYogContent from './BhawnaYogContent';
import type { PageBlockType } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function BhawnaYogPage() {
  const [sessions, experiences, articles, audioTracks, layout] = await Promise.all([
    getPlaylistsForTab('bhawna-yog'),
    getPlaylistsForTab('bhawna-yog-experiences'),
    getArticlesBySection('bhawna-yog'),
    getAudioTracksBySection('bhawna-yog'),
    getPageLayout('bhawna-yog'),
  ]);
  const isEmpty = sessions.length === 0 && experiences.length === 0 && articles.length === 0 && audioTracks.length === 0;

  const renderBlock = (block: PageBlockType) => {
    switch (block) {
      case 'videos':
        return sessions.map((item) => (
          <VideoRow
            key={item.playlist.playlistId}
            title={item.playlist.playlistTitle}
            videos={item.videos}
          />
        ));
      case 'experiences':
        if (experiences.length === 0) return null;
        return (
          <>
            <div className="px-4 pt-6 md:px-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {'अनुभव'} <span className="text-base font-normal text-neutral-500">Experiences</span>
              </h2>
            </div>
            {experiences.map((item) => (
              <VideoRow
                key={item.playlist.playlistId}
                title={item.playlist.playlistTitle}
                videos={item.videos}
              />
            ))}
          </>
        );
      case 'articles':
        if (articles.length === 0) return null;
        return <BhawnaYogContent type="articles" articles={articles} audioTracks={[]} />;
      case 'audio':
        if (audioTracks.length === 0) return null;
        return <BhawnaYogContent type="audio" articles={[]} audioTracks={audioTracks} />;
      default:
        return null;
    }
  };

  return (
    <div className="pb-20 md:pb-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 px-4 py-4 text-white md:px-6 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="text-xl font-extrabold tracking-tight md:text-5xl">{'भावना योग'}</h1>
          <p className="mt-1 text-sm font-medium text-white/90 md:text-xl">Bhawna Yog</p>
          <p className="mt-0.5 text-xs text-white/70 md:text-base">
            Guided meditation sessions by Muni Pramansagar Ji Maharaj
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-1 pt-4">
        {isEmpty && (
          <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No Bhawna Yog content yet</p>
            <p className="mt-2 text-sm">Tag playlists, add articles, or upload audio from the admin panel.</p>
          </div>
        )}

        {layout.blocks.map((block) => (
          <div key={block}>{renderBlock(block)}</div>
        ))}
      </div>
    </div>
  );
}
