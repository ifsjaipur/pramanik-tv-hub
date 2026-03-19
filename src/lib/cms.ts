import type { CmsSection, CmsChannel, CmsHighlight, CmsUnlistedVideo, CmsPlaylistTag, PlaylistTag, CmsArticle, CmsAudioTrack, CmsPageLayout, PageBlockType } from '@/types';
import { cmsSet, cmsGet, cmsDel, cmsKeys } from './redis';

// Redis key prefixes (no TTL = persistent, safe from volatile-lru eviction)
const PREFIX = {
  section: 'cms:section:',
  sectionOrder: 'cms:sections:order',
  channel: 'cms:channel:',
  channelList: 'cms:channels:list',
  highlight: 'cms:highlight:',
  highlightList: 'cms:highlights:list',
  unlisted: 'cms:unlisted:',
  unlistedList: 'cms:unlisted:list',
  playlistTag: 'cms:playlist-tag:',
  playlistTagList: 'cms:playlist-tags:list',
  article: 'cms:article:',
  articleList: 'cms:articles:list',
  audio: 'cms:audio:',
  audioList: 'cms:audio:list',
  pageLayout: 'cms:page-layout:',
} as const;

// --- Sections ---

export async function getSections(): Promise<CmsSection[]> {
  const ids = await cmsGet<string[]>(PREFIX.sectionOrder);
  if (!ids || ids.length === 0) return [];
  const sections = await Promise.all(
    ids.map((id) => cmsGet<CmsSection>(`${PREFIX.section}${id}`))
  );
  return sections.filter(Boolean) as CmsSection[];
}

export async function getSection(id: string): Promise<CmsSection | null> {
  return cmsGet<CmsSection>(`${PREFIX.section}${id}`);
}

export async function saveSection(section: CmsSection): Promise<void> {
  await cmsSet(`${PREFIX.section}${section.id}`, section);
  const ids = (await cmsGet<string[]>(PREFIX.sectionOrder)) ?? [];
  if (!ids.includes(section.id)) {
    ids.push(section.id);
    await cmsSet(PREFIX.sectionOrder, ids);
  }
}

export async function deleteSection(id: string): Promise<void> {
  await cmsDel(`${PREFIX.section}${id}`);
  const ids = (await cmsGet<string[]>(PREFIX.sectionOrder)) ?? [];
  await cmsSet(PREFIX.sectionOrder, ids.filter((i) => i !== id));
}

export async function reorderSections(orderedIds: string[]): Promise<void> {
  await cmsSet(PREFIX.sectionOrder, orderedIds);
}

// --- Channels ---

export async function getChannels(): Promise<CmsChannel[]> {
  const keys = (await cmsGet<string[]>(PREFIX.channelList)) ?? [];
  if (keys.length === 0) return [];
  const channels = await Promise.all(
    keys.map((key) => cmsGet<CmsChannel>(`${PREFIX.channel}${key}`))
  );
  return (channels.filter(Boolean) as CmsChannel[]).sort((a, b) => a.priority - b.priority);
}

export async function getChannel(key: string): Promise<CmsChannel | null> {
  return cmsGet<CmsChannel>(`${PREFIX.channel}${key}`);
}

export async function saveChannel(channel: CmsChannel): Promise<void> {
  await cmsSet(`${PREFIX.channel}${channel.key}`, channel);
  const keys = (await cmsGet<string[]>(PREFIX.channelList)) ?? [];
  if (!keys.includes(channel.key)) {
    keys.push(channel.key);
    await cmsSet(PREFIX.channelList, keys);
  }
}

export async function deleteChannel(key: string): Promise<void> {
  await cmsDel(`${PREFIX.channel}${key}`);
  const keys = (await cmsGet<string[]>(PREFIX.channelList)) ?? [];
  await cmsSet(PREFIX.channelList, keys.filter((k) => k !== key));
}

// --- Highlights ---

export async function getHighlights(): Promise<CmsHighlight[]> {
  const ids = (await cmsGet<string[]>(PREFIX.highlightList)) ?? [];
  if (ids.length === 0) return [];
  const highlights = await Promise.all(
    ids.map((id) => cmsGet<CmsHighlight>(`${PREFIX.highlight}${id}`))
  );
  return (highlights.filter(Boolean) as CmsHighlight[])
    .filter((h) => h.active)
    .sort((a, b) => b.priority - a.priority);
}

export async function getActiveHighlights(): Promise<CmsHighlight[]> {
  const all = await getHighlights();
  const now = new Date().toISOString();
  return all.filter((h) => h.startDate <= now && h.endDate >= now);
}

export async function saveHighlight(highlight: CmsHighlight): Promise<void> {
  await cmsSet(`${PREFIX.highlight}${highlight.id}`, highlight);
  const ids = (await cmsGet<string[]>(PREFIX.highlightList)) ?? [];
  if (!ids.includes(highlight.id)) {
    ids.push(highlight.id);
    await cmsSet(PREFIX.highlightList, ids);
  }
}

export async function deleteHighlight(id: string): Promise<void> {
  await cmsDel(`${PREFIX.highlight}${id}`);
  const ids = (await cmsGet<string[]>(PREFIX.highlightList)) ?? [];
  await cmsSet(PREFIX.highlightList, ids.filter((i) => i !== id));
}

// --- Unlisted Videos ---

export async function getUnlistedVideos(): Promise<CmsUnlistedVideo[]> {
  const ids = (await cmsGet<string[]>(PREFIX.unlistedList)) ?? [];
  if (ids.length === 0) return [];
  const videos = await Promise.all(
    ids.map((id) => cmsGet<CmsUnlistedVideo>(`${PREFIX.unlisted}${id}`))
  );
  return videos.filter(Boolean) as CmsUnlistedVideo[];
}

export async function saveUnlistedVideo(video: CmsUnlistedVideo): Promise<void> {
  await cmsSet(`${PREFIX.unlisted}${video.videoId}`, video);
  const ids = (await cmsGet<string[]>(PREFIX.unlistedList)) ?? [];
  if (!ids.includes(video.videoId)) {
    ids.push(video.videoId);
    await cmsSet(PREFIX.unlistedList, ids);
  }
}

export async function deleteUnlistedVideo(videoId: string): Promise<void> {
  await cmsDel(`${PREFIX.unlisted}${videoId}`);
  const ids = (await cmsGet<string[]>(PREFIX.unlistedList)) ?? [];
  await cmsSet(PREFIX.unlistedList, ids.filter((i) => i !== videoId));
}

// --- Playlist Tags ---

export async function getPlaylistTags(): Promise<CmsPlaylistTag[]> {
  const ids = (await cmsGet<string[]>(PREFIX.playlistTagList)) ?? [];
  if (ids.length === 0) return [];
  const tags = await Promise.all(    ids.map((id) => cmsGet<CmsPlaylistTag>(`${PREFIX.playlistTag}${id}`))  );
  return tags.filter(Boolean) as CmsPlaylistTag[];
}

export async function getPlaylistsByTag(tag: PlaylistTag): Promise<CmsPlaylistTag[]> {  const all = await getPlaylistTags();  return all.filter((t) => t.tag === tag);
}

export async function getHomePlaylistTags(): Promise<CmsPlaylistTag[]> {
  const all = await getPlaylistTags();
  return all.filter((t) => t.showOnHome);
}

export async function savePlaylistTag(tag: CmsPlaylistTag): Promise<void> {
  await cmsSet(`${PREFIX.playlistTag}${tag.playlistId}`, tag);
  const ids = (await cmsGet<string[]>(PREFIX.playlistTagList)) ?? [];
  if (!ids.includes(tag.playlistId)) {
    ids.push(tag.playlistId);
    await cmsSet(PREFIX.playlistTagList, ids);
  }}

export async function deletePlaylistTag(playlistId: string): Promise<void> {
  await cmsDel(`${PREFIX.playlistTag}${playlistId}`);
  const ids = (await cmsGet<string[]>(PREFIX.playlistTagList)) ?? [];
  await cmsSet(PREFIX.playlistTagList, ids.filter((i) => i !== playlistId));
}

export async function bulkSavePlaylistTags(tags: CmsPlaylistTag[]): Promise<void> {
  const ids = (await cmsGet<string[]>(PREFIX.playlistTagList)) ?? [];
  const idSet = new Set(ids);
  for (const tag of tags) {
    await cmsSet(`${PREFIX.playlistTag}${tag.playlistId}`, tag);
    idSet.add(tag.playlistId);
  }
 await cmsSet(PREFIX.playlistTagList, [...idSet]);
}
// --- Page Layout ---

const DEFAULT_LAYOUT: PageBlockType[] = ['videos', 'experiences', 'articles', 'audio'];

export async function getPageLayout(pageKey: string): Promise<CmsPageLayout> {
  const layout = await cmsGet<CmsPageLayout>(`${PREFIX.pageLayout}${pageKey}`);
  return layout ?? { pageKey, blocks: DEFAULT_LAYOUT, updatedAt: '' };
}

export async function savePageLayout(layout: CmsPageLayout): Promise<void> {
  await cmsSet(`${PREFIX.pageLayout}${layout.pageKey}`, layout);
}

// --- Articles ---

export async function getArticles(): Promise<CmsArticle[]> {
  const ids = (await cmsGet<string[]>(PREFIX.articleList)) ?? [];
  if (ids.length === 0) return [];
  const articles = await Promise.all(
    ids.map((id) => cmsGet<CmsArticle>(`${PREFIX.article}${id}`))
  );
  return (articles.filter(Boolean) as CmsArticle[]).sort((a, b) => a.order - b.order);
}

export async function getArticlesBySection(section: string): Promise<CmsArticle[]> {
  const all = await getArticles();
  return all.filter((a) => a.section === section && a.visible);
}

export async function getArticleBySlug(slug: string): Promise<CmsArticle | null> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function saveArticle(article: CmsArticle): Promise<void> {
  await cmsSet(`${PREFIX.article}${article.id}`, article);
  const ids = (await cmsGet<string[]>(PREFIX.articleList)) ?? [];
  if (!ids.includes(article.id)) {
    ids.push(article.id);
    await cmsSet(PREFIX.articleList, ids);
  }
}

export async function deleteArticle(id: string): Promise<void> {
  await cmsDel(`${PREFIX.article}${id}`);
  const ids = (await cmsGet<string[]>(PREFIX.articleList)) ?? [];
  await cmsSet(PREFIX.articleList, ids.filter((i) => i !== id));
}

// --- Audio Tracks ---

export async function getAudioTracks(): Promise<CmsAudioTrack[]> {
  const ids = (await cmsGet<string[]>(PREFIX.audioList)) ?? [];
  if (ids.length === 0) return [];
  const tracks = await Promise.all(
    ids.map((id) => cmsGet<CmsAudioTrack>(`${PREFIX.audio}${id}`))
  );
  return (tracks.filter(Boolean) as CmsAudioTrack[]).sort((a, b) => a.order - b.order);
}

export async function getAudioTracksBySection(section: string): Promise<CmsAudioTrack[]> {
  const all = await getAudioTracks();
  return all.filter((t) => t.section === section && t.visible);
}

export async function saveAudioTrack(track: CmsAudioTrack): Promise<void> {
  await cmsSet(`${PREFIX.audio}${track.id}`, track);
  const ids = (await cmsGet<string[]>(PREFIX.audioList)) ?? [];
  if (!ids.includes(track.id)) {
    ids.push(track.id);
    await cmsSet(PREFIX.audioList, ids);
  }
}

export async function deleteAudioTrack(id: string): Promise<void> {
  await cmsDel(`${PREFIX.audio}${id}`);
  const ids = (await cmsGet<string[]>(PREFIX.audioList)) ?? [];
  await cmsSet(PREFIX.audioList, ids.filter((i) => i !== id));
}

// --- Export/Import ---

export async function exportCmsState(): Promise<{
  sections: CmsSection[];
  channels: CmsChannel[];
  highlights: CmsHighlight[];
  unlistedVideos: CmsUnlistedVideo[];
  playlistTags: CmsPlaylistTag[];
  articles: CmsArticle[];
  audioTracks: CmsAudioTrack[];
}> {
  const [sections, channels, highlights, unlistedVideos, playlistTags, articles, audioTracks] = await Promise.all([
    getSections(),
    getChannels(),
    getHighlights(),
    getUnlistedVideos(),
    getPlaylistTags(),
    getArticles(),
    getAudioTracks(),
  ]);
  return { sections, channels, highlights, unlistedVideos, playlistTags, articles, audioTracks };
}

export async function importCmsState(state: {
  sections?: CmsSection[];
  channels?: CmsChannel[];
  highlights?: CmsHighlight[];
  unlistedVideos?: CmsUnlistedVideo[];
  playlistTags?: CmsPlaylistTag[];
  articles?: CmsArticle[];
  audioTracks?: CmsAudioTrack[];
}): Promise<void> {
  if (state.sections) {
    for (const s of state.sections) await saveSection(s);
    await reorderSections(state.sections.map((s) => s.id));
  }
  if (state.channels) {
    for (const c of state.channels) await saveChannel(c);
  }
  if (state.highlights) {
    for (const h of state.highlights) await saveHighlight(h);
  }
  if (state.unlistedVideos) {
    for (const v of state.unlistedVideos) await saveUnlistedVideo(v);
  }
  if (state.playlistTags) {
    await bulkSavePlaylistTags(state.playlistTags);
  }
  if (state.articles) {
    for (const a of state.articles) await saveArticle(a);
  }
  if (state.audioTracks) {
    for (const t of state.audioTracks) await saveAudioTrack(t);
  }
}
