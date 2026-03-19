import type { Metadata } from 'next';
import { getPlaylistsForTab } from '@/lib/content-tabs';
import VideoRow from '@/components/video/VideoRow';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Jain Pathshala — For Kids',
  description: 'Animated stories and Jain teachings for kids by Pramanik Samooh',
};

export default async function KidsPage() {
  const playlists = await getPlaylistsForTab('kids');

  return (
    <div className="pb-20 md:pb-8">
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center md:px-6 md:py-12">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
            Jain Pathshala
          </h1>
          <p className="mt-1 text-lg text-neutral-500">
            {'जैन पाठशाला'}
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Animated stories and Jain teachings for kids
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-1 pt-4">
        {playlists.length === 0 && (
          <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No Kids playlists tagged yet</p>
            <p className="mt-2 text-sm">Tag playlists from the admin panel to see them here.</p>
          </div>
        )}
        {playlists.map((item) => (
          <VideoRow
            key={item.playlist.playlistId}
            title={item.playlist.playlistTitle}
            videos={item.videos}
          />
        ))}
      </div>
    </div>
  );
}
