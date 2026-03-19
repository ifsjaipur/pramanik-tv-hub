import { getPlaylistsForTab } from '@/lib/content-tabs';
import VideoRow from '@/components/video/VideoRow';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function QAPage() {
  const playlists = await getPlaylistsForTab('qa');

  return (
    <div className="pb-20 md:pb-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 px-4 py-4 text-white md:px-6 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="text-xl font-extrabold tracking-tight md:text-5xl">{'शंका समाधान'}</h1>
          <p className="mt-1 text-sm font-medium text-white/90 md:text-xl">Shanka Samadhan (Q&amp;A)</p>
          <p className="mt-0.5 text-xs text-white/70 md:text-base">
            Best clips from Shanka Samadhan sessions
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-1 pt-4">
        {playlists.length === 0 && (
          <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No Q&amp;A playlists tagged yet</p>
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
