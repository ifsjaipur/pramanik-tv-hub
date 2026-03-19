import type { ChannelKey, Playlist, Video } from '@/types';
import { CHANNELS } from '@/config/channels';
import { getChannelByKeyWithCms } from './channels-cms';
import { categoriseVideo } from './categorise';
import { formatDuration, formatViewCount, getVideoPageUrl, getYoutubeThumbnail, getYoutubeWatchUrl } from './formatters';
import { CACHE_KEYS, CACHE_TTL, getCachedOrFetch } from './redis';

const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

function getApiKeys(): string[] {
  const keys: string[] = [];
  // Support up to 10 API keys from different Google Cloud projects
  const envKeys = ['YOUTUBE_API_KEY', ...Array.from({ length: 9 }, (_, i) => `YOUTUBE_API_KEY_${i + 2}`)];
  for (const envKey of envKeys) {
    const val = process.env[envKey];
    if (val) keys.push(val);
  }
  if (keys.length === 0) throw new Error('No YOUTUBE_API_KEY set');
  return keys;
}

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    resourceId: { videoId: string };
    channelTitle: string;
    thumbnails: Record<string, { url: string }>;
  };
  contentDetails: { videoId: string };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    tags?: string[];
    thumbnails: Record<string, { url: string }>;
    liveBroadcastContent: string;
  };
  contentDetails: { duration: string };
  statistics: {
    viewCount?: string;
    likeCount?: string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
  };
}

interface YouTubePlaylistMeta {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string }>;
  };
  contentDetails: { itemCount: number };
}

// --- Core fetch helper ---

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const keys = getApiKeys();

  for (let i = 0; i < keys.length; i++) {
    const url = new URL(`${YOUTUBE_BASE}/${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set('key', keys[i]);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (res.ok) return res.json();

    const err = await res.text();
    console.error(`YouTube API ${res.status} [key ${i + 1}/${keys.length}] [${path}]:`, err);

    // If quota exceeded (403) and we have more keys, try next key
    if (res.status === 403 && i < keys.length - 1) {
      console.log(`Switching to fallback API key ${i + 2}...`);
      continue;
    }

    throw new Error(`YouTube API error: ${res.status}`);
  }

  throw new Error('All YouTube API keys exhausted');
}

async function fetchPlaylistItems(playlistId: string, maxResults = 200): Promise<YouTubePlaylistItem[]> {
  const allItems: YouTubePlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: '50',
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await ytFetch<{ items?: YouTubePlaylistItem[]; nextPageToken?: string }>('playlistItems', params);
    allItems.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken && allItems.length < maxResults);

  return allItems.slice(0, maxResults);
}

async function fetchVideoDetails(videoIds: string[]): Promise<YouTubeVideoItem[]> {
  if (videoIds.length === 0) return [];
  const results: YouTubeVideoItem[] = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await ytFetch<{ items?: YouTubeVideoItem[] }>('videos', {
      part: 'snippet,contentDetails,statistics,liveStreamingDetails',
      id: batch.join(','),
    });
    results.push(...(data.items ?? []));
  }
  return results;
}

// --- Playlist discovery ---

export async function fetchChannelPlaylists(channelKey: ChannelKey | string): Promise<Playlist[]> {
  const channel = (channelKey in CHANNELS) ? CHANNELS[channelKey as ChannelKey] : await getChannelByKeyWithCms(channelKey);
  if (!channel || !channel.id) return [];

  return getCachedOrFetch(
    `playlists:${channelKey}`,
    async () => {
      const allPlaylists: Playlist[] = [];
      let pageToken: string | undefined;

      do {
        const params: Record<string, string> = {
          part: 'snippet,contentDetails',
          channelId: channel.id,
          maxResults: '50',
        };
        if (pageToken) params.pageToken = pageToken;

        const data = await ytFetch<{ items?: YouTubePlaylistMeta[]; nextPageToken?: string }>('playlists', params);
        for (const item of data.items ?? []) {
          allPlaylists.push({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? '',
            channelKey,
            videoCount: item.contentDetails.itemCount,
            publishedAt: item.snippet.publishedAt,
          });
        }
        pageToken = data.nextPageToken;
      } while (pageToken);

      return allPlaylists.filter((p) => p.videoCount > 0);
    },
    CACHE_TTL.default
  );
}

// --- Video mapping ---

function isShortDuration(duration: string): boolean {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours === 0 && minutes <= 1 && seconds <= 60;
}

function mapToVideo(
  item: YouTubeVideoItem,
  channelKey: ChannelKey,
  playlistId?: string,
  playlistTitle?: string
): Video {
  const channel = CHANNELS[channelKey];
  const duration = item.contentDetails?.duration ?? 'PT0S';
  const viewCount = parseInt(item.statistics?.viewCount ?? '0');
  const isLive = item.snippet.liveBroadcastContent === 'live';
  const isUpcoming = item.snippet.liveBroadcastContent === 'upcoming';

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: getYoutubeThumbnail(item.id, 'mq'),
    thumbnailUrlHQ: getYoutubeThumbnail(item.id, 'hq'),
    channelKey,
    channelName: channel.name,
    categorySlug: categoriseVideo(item.snippet.title, item.snippet.description, channelKey),
    playlistId,
    playlistTitle,
    publishedAt: item.snippet.publishedAt,
    duration,
    durationFormatted: formatDuration(duration),
    viewCount,
    viewCountFormatted: formatViewCount(viewCount),
    isLive,
    isUpcoming,
    isShort: isShortDuration(duration),
    tags: item.snippet.tags ?? [],
    url: getVideoPageUrl(item.id),
    youtubeUrl: getYoutubeWatchUrl(item.id),
  };
}

// --- Public API ---

export async function getPlaylistVideos(playlistId: string, channelKey: ChannelKey, playlistTitle?: string, maxResults = 200): Promise<Video[]> {
  return getCachedOrFetch(
    `playlist:${playlistId}:videos`,
    async () => {
      const items = await fetchPlaylistItems(playlistId, maxResults);
      const videoIds = items.map((item) => item.contentDetails.videoId);
      const details = await fetchVideoDetails(videoIds);
      return details
        .map((item) => mapToVideo(item, channelKey, playlistId, playlistTitle))
        .filter((v) => !v.isShort);
    },
    CACHE_TTL.default
  );
}

export async function getChannelVideos(channelKey: ChannelKey, maxResults = 200): Promise<Video[]> {
  const channel = CHANNELS[channelKey];
  if (!channel.id) {
    console.warn('[youtube] Skipping ' + channelKey + ': no channel ID configured');
    return [];
  }
  const ttl = CACHE_TTL[channelKey] ?? CACHE_TTL.default;

  return getCachedOrFetch(
    CACHE_KEYS.channelVideos(channelKey),
    async () => {
      const playlists = await fetchChannelPlaylists(channelKey);

      if (playlists.length === 0) {
        const uploadsPlaylistId = 'UU' + channel.id.slice(2);
        const items = await fetchPlaylistItems(uploadsPlaylistId, maxResults);
        const videoIds = items.map((item) => item.contentDetails.videoId);
        const details = await fetchVideoDetails(videoIds);
        return details
          .map((item) => mapToVideo(item, channelKey))
          .filter((v) => !v.isShort);
      }

      const seen = new Set<string>();
      const allVideos: Video[] = [];

      const results = await Promise.allSettled(
        playlists.map((pl) => getPlaylistVideos(pl.id, channelKey, pl.title, 50))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const video of result.value) {
            if (!seen.has(video.id)) {
              seen.add(video.id);
              allVideos.push(video);
            }
          }
        }
      }

      return allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    },
    ttl
  );
}

export async function getAllVideos(): Promise<Video[]> {
  return getCachedOrFetch(
    CACHE_KEYS.allVideos(),
    async () => {
      const channelKeys = Object.keys(CHANNELS) as ChannelKey[];
      const results = await Promise.allSettled(
        channelKeys.map((key) => getChannelVideos(key))
      );
      const videos: Video[] = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          videos.push(...result.value);
        } else {
          console.error('[youtube] Failed ' + channelKeys[i] + ':', result.reason?.message || result.reason);
        }
      });
      return videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    },
    CACHE_TTL.default
  );
}

export async function getVideoById(videoId: string): Promise<Video | null> {
  return getCachedOrFetch(
    CACHE_KEYS.videoDetail(videoId),
    async () => {
      const details = await fetchVideoDetails([videoId]);
      if (details.length === 0) return null;
      const item = details[0];
      const channelKey = (Object.entries(CHANNELS).find(
        ([, ch]) => ch.name === item.snippet.channelTitle || ch.handle.slice(1) === item.snippet.channelTitle
      )?.[0] ?? 'pramansagarji') as ChannelKey;
      return mapToVideo(item, channelKey);
    },
    CACHE_TTL.videoDetail
  );
}

async function searchEventAllChannels(eventType: 'live' | 'upcoming'): Promise<Video[]> {
  const channelKeys = Object.keys(CHANNELS) as ChannelKey[];
  const allVideos: Video[] = [];
  const results = await Promise.allSettled(
    channelKeys.map(async (key) => {
      const channel = CHANNELS[key];
      if (!channel.id) return [];
      const data = await ytFetch<{ items?: { id: { videoId: string } }[] }>('search', {
        part: 'snippet',
        channelId: channel.id,
        eventType,
        type: 'video',
      });
      const videoIds = (data.items ?? []).map((item) => item.id.videoId);
      if (videoIds.length === 0) return [];
      const details = await fetchVideoDetails(videoIds);
      return details.map((item) => mapToVideo(item, key));
    })
  );
  for (const result of results) {
    if (result.status === 'fulfilled') allVideos.push(...result.value);
  }
  return allVideos;
}

export async function getLiveStreams(): Promise<Video[]> {
  return getCachedOrFetch(
    CACHE_KEYS.liveStreams(),
    () => searchEventAllChannels('live'),
    CACHE_TTL.liveStreams
  );
}

export async function getUpcomingStreams(): Promise<Video[]> {
  return getCachedOrFetch(
    CACHE_KEYS.upcomingStreams(),
    () => searchEventAllChannels('upcoming'),
    CACHE_TTL.upcomingStreams
  );
}

export async function getVideosByCategory(categorySlug: string): Promise<Video[]> {
  const allVideos = await getAllVideos();
  return allVideos.filter((v) => v.categorySlug === categorySlug);
}

export async function getVideosByChannel(channelKey: ChannelKey): Promise<Video[]> {
  return getChannelVideos(channelKey);
}

export async function getRelatedVideos(video: Video, limit = 8): Promise<Video[]> {
  const allVideos = await getAllVideos();
  return allVideos
    .filter((v) => v.id !== video.id && (v.categorySlug === video.categorySlug || v.channelKey === video.channelKey))
    .slice(0, limit);
}
