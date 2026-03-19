import Link from 'next/link';
import { getPlaylistsForTab } from '@/lib/content-tabs';
import { getArticlesBySection, getAudioTracksBySection, getPageLayout } from '@/lib/cms';
import SectionContent from '@/components/section/SectionContent';
import type { PageBlockType } from '@/types';

export const revalidate = 3600;

export default async function SwadhyayPage() {
  const [playlists, articles, audioTracks, layout] = await Promise.all([
    getPlaylistsForTab('swadhyay'),
    getArticlesBySection('swadhyay'),
    getAudioTracksBySection('swadhyay'),
    getPageLayout('swadhyay'),
  ]);

  const isEmpty = playlists.length === 0 && articles.length === 0 && audioTracks.length === 0;

  const renderBlock = (block: PageBlockType) => {
    switch (block) {
      case 'videos':
      case 'experiences':
        if (playlists.length === 0) return null;
        return (
          <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {playlists.map((item) => (
                <Link
                  key={item.playlist.playlistId}
                  href={'/swadhyay/' + item.playlist.playlistId}
                  className="group rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {item.videos[0] && (
                    <img
                      src={item.videos[0].thumbnailUrl}
                      alt={item.playlist.playlistTitle}
                      className="mb-3 aspect-video w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-saffron-600 dark:text-white dark:group-hover:text-saffron-400">
                    {item.playlist.playlistTitle}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">{item.videos.length} videos</p>
                </Link>
              ))}
            </div>
          </div>
        );
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 px-4 py-4 text-white md:px-6 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="text-xl font-extrabold tracking-tight md:text-5xl">{'स्वाध्याय'}</h1>
          <p className="mt-1 text-sm font-medium text-white/90 md:text-xl">Swadhyay</p>
          <p className="mt-0.5 text-xs text-white/70 md:text-base">
            Self-study series on Jain scriptures and texts
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-1">
        {isEmpty && (
          <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No Swadhyay content yet</p>
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
