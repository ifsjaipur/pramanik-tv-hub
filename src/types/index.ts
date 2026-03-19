export type ChannelKey = 'pramansagarji' | 'bestofshankasamadhan' | 'shankasamadhan' | 'jainpathshala';

export type CategorySlug =
  | 'discourse'
  | 'bhawna-yog'
  | 'swadhyay'
  | 'shanka-clips'
  | 'shanka-full'
  | 'live'
  | 'kids';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailUrlHQ: string;
  channelKey: ChannelKey | string;
  channelName: string;
  categorySlug: CategorySlug;
  playlistId?: string;
  playlistTitle?: string;
  publishedAt: string;
  duration: string;
  durationFormatted: string;
  viewCount: number;
  viewCountFormatted: string;
  isLive: boolean;
  isUpcoming: boolean;
  isShort: boolean;
  tags: string[];
  url: string;
  youtubeUrl: string;
}

export interface Playlist {
  id: string;
  title: string;
  titleHi?: string;
  description: string;
  thumbnailUrl: string;
  channelKey: ChannelKey | string;
  videoCount: number;
  publishedAt: string;
}

export interface Channel {
  key: ChannelKey;
  id: string;
  handle: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  color: string;
  icon: string;
  priority: number;
  isKids?: boolean;
  videoCount?: number;
}

export interface HomeRow {
  id: string;
  label: string;
  labelHi: string;
  videos: Video[];
  viewAllUrl?: string;
}

export interface HomeRowConfig {
  id: string;
  label: string;
  labelHi: string;
  type: 'live' | 'category' | 'channel' | 'playlist';
  category?: string;
  channel?: string;
  channels?: string[];
  playlistId?: string;
  limit?: number;
  showWhenEmpty?: boolean;
}

export interface SearchIndex {
  videos: Pick<Video, 'id' | 'title' | 'description' | 'channelKey' | 'categorySlug' | 'thumbnailUrl' | 'durationFormatted'>[];
  builtAt: string;
}

export interface ApiVideosResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  nextPage: number | null;
}

export interface CategoryConfig {
  slug: CategorySlug;
  label: string;
  labelHi: string;
  icon: string;
  channels: ChannelKey[];
  keywords: string[];
}

export type ThumbnailQuality = 'max' | 'hq' | 'mq' | 'sd';

// --- CMS Types ---

export interface CmsChannel {
  key: string;
  id: string;
  handle: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  color: string;
  icon: string;
  priority: number;
  isKids?: boolean;
  addedAt: string;
}

export interface CmsSection {
  id: string;
  label: string;
  labelHi: string;
  type: 'playlist' | 'channel' | 'category' | 'highlights';
  playlistId?: string;
  channelKey?: string;
  categorySlug?: string;
  limit: number;
  order: number;
  visible: boolean;
}

export interface CmsHighlight {
  id: string;
  videoId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: number;
  active: boolean;
}

export interface CmsUnlistedVideo {
  videoId: string;
  title: string;
  channelKey: string;
  categorySlug: CategorySlug;
  playlistId?: string;
  addedAt: string;
}

// --- Playlist Tagging ---

export type PlaylistTag = 'bhawna-yog' | 'bhawna-yog-experiences' | 'swadhyay' | 'pravachan-monthly' | 'pravachan-special' | 'events' | 'qa' | 'kids' | 'other';

export interface CmsPlaylistTag {
  playlistId: string;
  playlistTitle: string;
  channelKey: string;
  tag: PlaylistTag;
  taggedAt: string;
  showOnHome?: boolean;
  order?: number;
}


// --- Articles (Text Pages) ---

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  titleHi: string;
  body: string;        // Markdown content (English)
  bodyHi: string;      // Markdown content (Hindi)
  section: string;     // e.g. 'bhawna-yog', 'swadhyay', 'general'
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Audio Tracks ---

export interface CmsAudioTrack {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  audioUrl: string;     // URL to MP3 file (external host or public/)
  duration: string;     // e.g. '12:30'
  section: string;      // e.g. 'bhawna-yog', 'swadhyay', 'general'
  order: number;
  visible: boolean;
  createdAt: string;
}

// --- Page Layout ---

export type PageBlockType = 'articles' | 'audio' | 'videos' | 'experiences';

export interface CmsPageLayout {
  pageKey: string;          // e.g. 'bhawna-yog', 'swadhyay'
  blocks: PageBlockType[];  // ordered list of content blocks
  updatedAt: string;
}
