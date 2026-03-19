import { getLiveStreams, getUpcomingStreams, fetchChannelPlaylists, getPlaylistVideos, getChannelVideos, getVideosByCategory, getVideoById } from '@/lib/youtube';
import type { ChannelKey, Video, CmsSection } from '@/types';
import TvVideoRow from '@/components/tv/TvVideoRow';
import { getSections, getActiveHighlights } from '@/lib/cms';
import { getPlaylistsForTab, getPlaylistsForTags, getHomeFeaturedPlaylists } from '@/lib/content-tabs';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface RowData {
  id: string;
  label: string;
  labelHi: string;
  videos: Video[];
  viewAllUrl?: string;
}
async function resolveCmsSection(section: CmsSection): Promise<Video[]> {
  switch (section.type) {
    case 'playlist':
      if (!section.playlistId || !section.channelKey) return [];
      return getPlaylistVideos(section.playlistId, section.channelKey as ChannelKey, section.label, section.limit);
    case 'channel':
      if (!section.channelKey) return [];
      return (await getChannelVideos(section.channelKey as ChannelKey)).slice(0, section.limit);
    case 'category':
      if (!section.categorySlug) return [];
      return (await getVideosByCategory(section.categorySlug)).slice(0, section.limit);
    case 'highlights': {
      const highlights = await getActiveHighlights();
      const results = await Promise.allSettled(highlights.map((h) => getVideoById(h.videoId)));
      return results
        .filter((r): r is PromiseFulfilledResult<Video | null> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter(Boolean) as Video[];
    }
    default:
      return [];
  }
}

async function getCmsRows(): Promise<RowData[]> {
  const sections = await getSections();
  if (sections.length === 0) return [];
  const visible = sections.filter((s) => s.visible);
  const results = await Promise.allSettled(visible.map((s) => resolveCmsSection(s)));
  const rows: RowData[] = [];
  visible.forEach((section, i) => {
    const result = results[i];
    if (result.status === 'fulfilled' && result.value.length > 0) {
      rows.push({ id: section.id, label: section.label, labelHi: section.labelHi, videos: result.value });
    }
  });
  return rows;
}
async function getTagBasedRows(): Promise<RowData[]> {
  const rows: RowData[] = [];
  const [bhawna, swadhyay, pravachan, qa, kids] = await Promise.allSettled([
    getPlaylistsForTab('bhawna-yog'),
    getPlaylistsForTab('swadhyay'),
    getPlaylistsForTags(['pravachan-monthly', 'pravachan-special']),
    getPlaylistsForTab('qa'),
    getPlaylistsForTab('kids'),
  ]);
  if (bhawna.status === 'fulfilled' && bhawna.value.length > 0) {
    rows.push({
      id: 'bhawna-yog', label: 'Latest Bhawna Yog',
      labelHi: 'नवीनतम भावना योग',
      videos: bhawna.value[0].videos.slice(0, 12), viewAllUrl: '/bhawna-yog',
    });
  }
  if (swadhyay.status === 'fulfilled' && swadhyay.value.length > 0) {
    rows.push({
      id: 'swadhyay', label: swadhyay.value[0].playlist.playlistTitle,
      labelHi: 'स्वाध्याय',
      videos: swadhyay.value[0].videos.slice(0, 12), viewAllUrl: '/swadhyay',
    });
  }
  if (pravachan.status === 'fulfilled' && pravachan.value.length > 0) {
    rows.push({
      id: 'pravachan', label: pravachan.value[0].playlist.playlistTitle,
      labelHi: 'प्रवचन',
      videos: pravachan.value[0].videos.slice(0, 12), viewAllUrl: '/pravachan',
    });
  }
  if (qa.status === 'fulfilled' && qa.value.length > 0) {
    rows.push({
      id: 'qa', label: 'Shanka Samadhan',
      labelHi: 'शंका समाधान',
      videos: qa.value[0].videos.slice(0, 12), viewAllUrl: '/qa',
    });
  }
  if (kids.status === 'fulfilled' && kids.value.length > 0) {
    rows.push({
      id: 'kids', label: 'Jain Pathshala',
      labelHi: 'जैन पाठशाला',
      videos: kids.value[0].videos.slice(0, 12), viewAllUrl: '/kids',
    });
  }
  return rows;
}
async function getAutoRows(): Promise<RowData[]> {
  const rows: RowData[] = [];
  try {
    const playlists = await fetchChannelPlaylists('pramansagarji');
    const playlistResults = await Promise.allSettled(
      playlists.slice(0, 10).map((pl) => getPlaylistVideos(pl.id, 'pramansagarji', pl.title, 15))
    );
    playlists.slice(0, 10).forEach((pl, i) => {
      const result = playlistResults[i];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        rows.push({ id: 'playlist_' + pl.id, label: pl.title, labelHi: '', videos: result.value.slice(0, 12), viewAllUrl: '/channel/pramansagarji' });
      }
    });
  } catch (err) {
    console.error('Failed to fetch pramansagarji playlists:', err);
  }
  try {
    const shankaPlaylists = await fetchChannelPlaylists('bestofshankasamadhan');
    if (shankaPlaylists.length > 0) {
      const playlistResults = await Promise.allSettled(
        shankaPlaylists.slice(0, 5).map((pl) => getPlaylistVideos(pl.id, 'bestofshankasamadhan', pl.title, 15))
      );
      shankaPlaylists.slice(0, 5).forEach((pl, i) => {
        const result = playlistResults[i];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          rows.push({ id: 'playlist_' + pl.id, label: pl.title, labelHi: '', videos: result.value.slice(0, 12), viewAllUrl: '/channel/bestofshankasamadhan' });
        }
      });
    }
  } catch {}
  try {
    const kidsPlaylists = await fetchChannelPlaylists('jainpathshala');
    if (kidsPlaylists.length > 0) {
      const playlistResults = await Promise.allSettled(
        kidsPlaylists.slice(0, 3).map((pl) => getPlaylistVideos(pl.id, 'jainpathshala', pl.title, 15))
      );
      kidsPlaylists.slice(0, 3).forEach((pl, i) => {
        const result = playlistResults[i];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          rows.push({ id: 'playlist_' + pl.id, label: pl.title, labelHi: '', videos: result.value.slice(0, 12), viewAllUrl: '/kids' });
        }
      });
    }
  } catch {}
  return rows;
}
async function getHomeRows(): Promise<RowData[]> {
  const allRows: RowData[] = [];
  try {
    const liveVideos = await getLiveStreams();
    if (liveVideos.length > 0) {
      allRows.push({ id: 'live_now', label: 'Live Now', labelHi: 'अभी लाइव', videos: liveVideos });
    }
  } catch {}
  try {
    const upcomingVideos = await getUpcomingStreams();
    if (upcomingVideos.length > 0) {
      allRows.push({ id: 'upcoming', label: 'Upcoming', labelHi: 'आगामी', videos: upcomingVideos });
    }
  } catch {}

  try {
    const homeFeatured = await getHomeFeaturedPlaylists();
    for (const item of homeFeatured) {
      allRows.push({
        id: 'home_' + item.playlist.playlistId,
        label: item.playlist.playlistTitle,
        labelHi: '',
        videos: item.videos.slice(0, 12),
      });
    }
  } catch {}

  try {
    const cmsRows = await getCmsRows();
    if (cmsRows.length > 0) return [...allRows, ...cmsRows];
  } catch {}

  try {
    const tagRows = await getTagBasedRows();
    if (tagRows.length > 0) return [...allRows, ...tagRows];
  } catch {}
  const autoRows = await getAutoRows();
  return [...allRows, ...autoRows];
}

export default async function HomePage() {
  const rows = await getHomeRows();

  return (
    <div className="py-6">
      {/* TV Hero area */}
      <div className="relative mx-8 mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-saffron-700 via-saffron-600 to-saffron-500 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(241,177,68,0.2),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Pramanik TV
          </h1>
          <p className="mt-2 text-lg text-white/80">
            प्रवचन · भावना योग · शंका समाधान · जैन पाठशाला
          </p>
        </div>
      </div>

      {/* Content rows */}
      {rows.length === 0 && (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-medium text-neutral-400">Loading content...</p>
            <p className="mt-2 text-sm text-neutral-600">Please check YouTube API configuration.</p>
          </div>
        </div>
      )}
      {rows.map((row, i) => (
        <TvVideoRow
          key={row.id}
          title={row.label}
          titleHi={row.labelHi}
          videos={row.videos}
          viewAllUrl={row.viewAllUrl}
          priority={i === 0}
          cardSize={i === 0 ? 'large' : 'normal'}
        />
      ))}
    </div>
  );
}
