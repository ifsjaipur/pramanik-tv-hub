import Fuse from 'fuse.js';
import type { Video } from '@/types';

let searchIndex: Fuse<Video> | null = null;

export function buildSearchIndex(videos: Video[]): Fuse<Video> {
  searchIndex = new Fuse(videos, {
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'description', weight: 0.2 },
      { name: 'tags', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  });
  return searchIndex;
}

export function searchVideos(videos: Video[], query: string): Video[] {
  if (!query.trim()) return [];
  const index = searchIndex ?? buildSearchIndex(videos);
  return index.search(query).map((r) => r.item);
}
