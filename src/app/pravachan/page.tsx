import { getPlaylistsForTab, getPravachanArchive } from '@/lib/content-tabs';
import { getArticlesBySection, getAudioTracksBySection, getPageLayout } from '@/lib/cms';
import VideoRow from '@/components/video/VideoRow';
import CollapsiblePlaylist from '@/components/video/CollapsiblePlaylist';
import SectionContent from '@/components/section/SectionContent';
import type { PageBlockType } from '@/types';

export const revalidate = 3600;

export default async function PravachanPage() {
  const [{ recent, older }, special, articles, audioTracks, layout] = await Promise.all([
    getPravachanArchive(3),
    getPlaylistsForTab('pravachan-special'),
    getArticlesBySection('pravachan'),
    getAudioTracksBySection('pravachan'),
    getPageLayout('pravachan'),
  ]);

  const isEmpty = recent.length === 0 && older.length === 0 && special.length === 0 && articles.length === 0 && audioTracks.length === 0;

  const renderBlock = (block: PageBlockType) => {
    switch (block) {
      case 'videos':
        if (recent.length === 0 && special.length === 0 && older.length === 0) return null;
        return (
          <>
            {recent.map((item) => (
              <VideoRow
                key={item.playlist.playlistId}
                title={item.playlist.playlistTitle}
                videos={item.videos}
              />
            ))}

            {special.length > 0 && (
              <>
                <div className="px-4 pt-6 md:px-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Special Series
                  </h2>
                </div>
                <div className="space-y-3 px-4 pt-3 md:px-6">
                  {special.map((item) => (
                    <CollapsiblePlaylist
                      key={item.playlist.playlistId}
                      title={item.playlist.playlistTitle}
                      videos={item.videos}
                      thumbnailUrl={item.videos[0]?.thumbnailUrl}
                    />
                  ))}
                </div>
              </>
            )}

            {older.length > 0 && (
              <div className="px-4 pt-6 md:px-6">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                  Older Pravachans
                </h2>
                <div className="space-y-3">
                  {older.map((item) => (
                    <CollapsiblePlaylist
                      key={item.playlist.playlistId}
                      title={item.playlist.playlistTitle}
                      videos={item.videos}
                      thumbnailUrl={item.videos[0]?.thumbnailUrl}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );
      case 'experiences':
        return null;
      case 'articles':
        if (articles.length === 0) return null;
        return <SectionContent type="articles" sectionLabel="Readings" sectionLabelHi="पठन सामग्री" articles={articles} />;
      case 'audio':
        if (audioTracks.length === 0) return null;
        return <SectionContent type="audio" sectionLabel="Audio" sectionLabelHi="ऑडियो" audioTracks={audioTracks} />;
      default:
        return null;
    }
  };

  return (
    <div className="pb-20 md:pb-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-saffron-700 via-saffron-600 to-saffron-800 px-4 py-4 text-white md:px-6 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="text-xl font-extrabold tracking-tight md:text-5xl">{'प्रवचन'}</h1>
          <p className="mt-1 text-sm font-medium text-white/90 md:text-xl">Pravachan Archive</p>
          <p className="mt-0.5 text-xs text-white/70 md:text-base">
            Monthly discourses and special series
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-1 pt-4">
        {isEmpty && (
          <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No Pravachan content yet</p>
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
