import 'server-only';

import type { PlaylistTag, Video, CmsPlaylistTag } from '@/types';
import { getPlaylistsByTag } from '@/lib/cms';
import { getPlaylistVideos } from '@/lib/youtube';
import type { ChannelKey } from '@/types';

export interface TaggedPlaylist {
  playlist: CmsPlaylistTag;
  videos: Video[];
}

async function fetchVideosForTags(tagged: CmsPlaylistTag[]): Promise<TaggedPlaylist[]> {
  if (tagged.length === 0) return [];
  const results: TaggedPlaylist[] = [];
  const batchSize = 10;
  for (let i = 0; i < tagged.length; i += batchSize) {
    const batch = tagged.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((t) => getPlaylistVideos(t.playlistId, t.channelKey as ChannelKey, t.playlistTitle, 50))
    );
    batch.forEach((t, idx) => {
      const result = settled[idx];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        results.push({ playlist: t, videos: result.value.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()) });
      }
    });
  }
  results.sort((a, b) => {
    const aOrd = a.playlist.order ?? 999;
    const bOrd = b.playlist.order ?? 999;
    if (aOrd !== bOrd) return aOrd - bOrd;
    const aDate = /^\d{4}-\d{2}/.test(a.playlist.playlistTitle);
    const bDate = /^\d{4}-\d{2}/.test(b.playlist.playlistTitle);
    if (aDate && bDate) return b.playlist.playlistTitle.localeCompare(a.playlist.playlistTitle);
    if (aDate) return -1;
    if (bDate) return 1;
    return a.playlist.playlistTitle.localeCompare(b.playlist.playlistTitle);
  });
  return results;
}

/** Get playlists for a single tag. */
export async function getPlaylistsForTab(tag: PlaylistTag): Promise<TaggedPlaylist[]> {
  const tagged = await getPlaylistsByTag(tag);
  return fetchVideosForTags(tagged);
}

/** Get playlists for multiple tags (e.g. all pravachan sub-types). */
export async function getPlaylistsForTags(tags: PlaylistTag[]): Promise<TaggedPlaylist[]> {
  const allTagged: CmsPlaylistTag[] = [];
  const results = await Promise.all(tags.map((t) => getPlaylistsByTag(t)));
  for (const r of results) allTagged.push(...r);
  return fetchVideosForTags(allTagged);
}

/** Pravachan Archive: recent months as rows, older as grid. Includes both monthly and special. */
export async function getPravachanArchive(recentMonths = 3): Promise<{
  recent: TaggedPlaylist[];
  older: TaggedPlaylist[];
}> {
  const all = await getPlaylistsForTags(['pravachan-monthly', 'pravachan-special']);
  const recent: TaggedPlaylist[] = [];
  const older: TaggedPlaylist[] = [];
  for (const item of all) {
    const match = item.playlist.playlistTitle.match(/^(\d{4})-(\d{2})/);
    if (match) {
      const now = new Date();
      const playlistDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1);
      const monthsAgo = (now.getFullYear() - playlistDate.getFullYear()) * 12 + now.getMonth() - playlistDate.getMonth();
      if (monthsAgo <= recentMonths) {
        recent.push(item);
      } else {
        older.push(item);
      }
    } else {
      older.push(item);
    }
  }
  return { recent, older };
}

/** Get playlists marked showOnHome in CMS. */
export async function getHomeFeaturedPlaylists(): Promise<TaggedPlaylist[]> {
  const { getHomePlaylistTags } = await import('@/lib/cms');
  const tagged = await getHomePlaylistTags();
  return fetchVideosForTags(tagged);
}
