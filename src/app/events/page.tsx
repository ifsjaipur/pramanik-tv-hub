import { getPlaylistsForTab } from '@/lib/content-tabs';
import CollapsiblePlaylist from '@/components/video/CollapsiblePlaylist';

export const revalidate = 3600;

export default async function EventsPage() {
  const playlists = await getPlaylistsForTab('events');

  return (
    <div className="pb-20 md:pb-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 px-4 py-4 text-white md:px-6 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="text-xl font-extrabold tracking-tight md:text-5xl">{'आयोजन'}</h1>
          <p className="mt-1 text-sm font-medium text-white/90 md:text-xl">Events</p>
          <p className="mt-0.5 text-xs text-white/70 md:text-base">
            Siddhchakra Vidhan, Panch Kalyanak and special events
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        {playlists.length === 0 && (
          <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-lg font-medium">No event playlists tagged yet</p>
            <p className="mt-2 text-sm">Tag playlists from the admin panel to see them here.</p>
          </div>
        )}
        <div className="space-y-3">
          {playlists.map((item) => (
            <CollapsiblePlaylist
              key={item.playlist.playlistId}
              title={item.playlist.playlistTitle}
              videos={item.videos}
              thumbnailUrl={item.videos[0]?.thumbnailUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
