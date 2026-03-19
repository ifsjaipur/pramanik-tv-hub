'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Playlist, CmsPlaylistTag, PlaylistTag } from '@/types';
import { Home } from 'lucide-react';

const CHANNELS = [
  { key: 'pramansagarji', label: 'Muni Pramansagar Ji' },
  { key: 'bestofshankasamadhan', label: 'Best of Shanka Samadhan' },
  { key: 'shankasamadhan', label: 'Shanka Samadhan' },
  { key: 'jainpathshala', label: 'Jain Pathshala' },
];

const TAG_OPTIONS: { value: PlaylistTag | ''; label: string; color: string }[] = [
  { value: '', label: 'Untagged', color: '#999' },
  { value: 'bhawna-yog', label: 'Bhawna Yog', color: '#E8730A' },
  { value: 'bhawna-yog-experiences', label: 'Bhawna Yog (Experiences)', color: '#F59E0B' },
  { value: 'swadhyay', label: 'Swadhyay', color: '#1A4E7A' },
  { value: 'pravachan-monthly', label: 'Pravachan (Monthly)', color: '#6B21A8' },
  { value: 'pravachan-special', label: 'Pravachan (Special)', color: '#9333EA' },
  { value: 'events', label: 'Events', color: '#059669' },
  { value: 'qa', label: 'Q&A', color: '#C9932A' },
  { value: 'kids', label: 'Kids', color: '#2563EB' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function suggestTag(playlist: Playlist): PlaylistTag | '' {
  const title = playlist.title.toLowerCase();
  if (playlist.channelKey === 'jainpathshala') return 'kids';
  if (playlist.channelKey === 'bestofshankasamadhan') return 'qa';
  if (playlist.channelKey === 'shankasamadhan') return 'qa';
  if (/bhawna\s*yog|bhavna\s*yog/i.test(title)) return 'bhawna-yog';
  if (/swadhyay/i.test(title)) return 'swadhyay';
  if (/vidhan|kalyanak|mahotsav|pratishtha/i.test(title)) return 'events';
  if (/^\d{4}-\d{2}/.test(title) || /^\d{4}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(title)) return 'pravachan-monthly';
  return '';
}
export default function PlaylistTagsPanel() {
  const [channelKey, setChannelKey] = useState(CHANNELS[0].key);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tags, setTags] = useState<Record<string, PlaylistTag | ''>>({});
  const [homeFlags, setHomeFlags] = useState<Record<string, boolean>>({});
  const [savedTags, setSavedTags] = useState<Record<string, CmsPlaylistTag>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadExistingTags = useCallback(async () => {
    try {
      const existing = await apiFetch<CmsPlaylistTag[]>('playlist-tags');
      const map: Record<string, CmsPlaylistTag> = {};
      for (const t of existing) map[t.playlistId] = t;
      setSavedTags(map);
    } catch {}
  }, []);

  const loadPlaylists = useCallback(async (ch: string) => {
    setLoading(true);
    setStatus('');
    try {
      const pls = await apiFetch<Playlist[]>(`playlists?channel=${ch}`);
      setPlaylists(pls);
      const newTags: Record<string, PlaylistTag | ''> = {};
      const newHome: Record<string, boolean> = {};
      for (const pl of pls) {
        if (savedTags[pl.id]) {
          newTags[pl.id] = savedTags[pl.id].tag;
          newHome[pl.id] = savedTags[pl.id].showOnHome ?? false;
        } else {
          newTags[pl.id] = suggestTag(pl);
          newHome[pl.id] = false;
        }
      }
      setTags(newTags);
      setHomeFlags(newHome);
    } catch (err) {
      setPlaylists([]);
      setStatus('Failed to load playlists: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  }, [savedTags]);

  useEffect(() => { loadExistingTags(); }, [loadExistingTags]);
  useEffect(() => { if (Object.keys(savedTags).length >= 0) loadPlaylists(channelKey); }, [channelKey, savedTags, loadPlaylists]);

  const filtered = useMemo(() => {
    if (!search) return playlists;
    const q = search.toLowerCase();
    return playlists.filter((pl) => pl.title.toLowerCase().includes(q) || pl.id.includes(q));
  }, [playlists, search]);

  const taggedCount = useMemo(() => {
    return playlists.filter((pl) => tags[pl.id] && tags[pl.id] !== '').length;
  }, [playlists, tags]);

  const hasChanges = useMemo(() => {
    return playlists.some((pl) => {
      const current = tags[pl.id] || '';
      const saved = savedTags[pl.id]?.tag || '';
      const currentHome = homeFlags[pl.id] ?? false;
      const savedHome = savedTags[pl.id]?.showOnHome ?? false;
      return current !== saved || currentHome !== savedHome;
    });
  }, [playlists, tags, homeFlags, savedTags]);

  const saveAll = async () => {
    setSaving(true);
    setStatus('');
    try {
      const toSave: CmsPlaylistTag[] = playlists
        .filter((pl) => tags[pl.id] && tags[pl.id] !== '')
        .map((pl) => ({
          playlistId: pl.id,
          playlistTitle: pl.title,
          channelKey,
          tag: tags[pl.id] as PlaylistTag,
          taggedAt: new Date().toISOString(),
          showOnHome: homeFlags[pl.id] ?? false,
        }));
      await apiFetch('playlist-tags', {
        method: 'POST',
        body: JSON.stringify({ bulk: true, tags: toSave }),
      });
      await loadExistingTags();
      setStatus(`Saved ${toSave.length} tags successfully`);
    } catch {
      setStatus('Failed to save tags');
    }
    setSaving(false);
  };

  const autoTagAll = () => {
    const newTags: Record<string, PlaylistTag | ''> = { ...tags };
    for (const pl of playlists) {
      if (!newTags[pl.id] || newTags[pl.id] === '') {
        newTags[pl.id] = suggestTag(pl);
      }
    }
    setTags(newTags);
  };
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Playlist Tags
        </h2>
        <div className="flex gap-2">
          <button
            onClick={autoTagAll}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Auto-Tag Untagged
          </button>
          <button
            onClick={saveAll}
            disabled={saving || !hasChanges}
            className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Tags'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={channelKey}
          onChange={(e) => setChannelKey(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
        >
          {CHANNELS.map((ch) => (
            <option key={ch.key} value={ch.key}>{ch.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search playlists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:w-64"
        />
        <span className="text-sm text-neutral-500">
          {taggedCount}/{playlists.length} tagged
          {hasChanges && <span className="ml-2 text-saffron-500">* unsaved changes</span>}
        </span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-500">Loading playlists...</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((pl) => {
            const currentTag = tags[pl.id] || '';
            const isSaved = savedTags[pl.id]?.tag === currentTag && currentTag as string !== '';
            const tagOption = TAG_OPTIONS.find((t) => t.value === currentTag);
            const isHome = homeFlags[pl.id] ?? false;

            return (
              <div
                key={pl.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {pl.title}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {pl.videoCount} videos
                    </span>
                    {isSaved && (
                      <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700 dark:bg-green-900 dark:text-green-300">
                        saved
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setHomeFlags({ ...homeFlags, [pl.id]: !isHome })}
                  title={isHome ? 'Remove from Home' : 'Show on Home'}
                  className={`shrink-0 rounded-lg p-1.5 transition-colors ${isHome ? 'bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400' : 'text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400'}`}
                >
                  <Home className="h-4 w-4" />
                </button>
                <select
                  value={currentTag}
                  onChange={(e) => setTags({ ...tags, [pl.id]: e.target.value as PlaylistTag | '' })}
                  className="shrink-0 rounded-lg border px-2 py-1.5 text-sm"
                  style={{
                    borderColor: tagOption?.color || '#d1d5db',
                    color: tagOption?.color || '#6b7280',
                    backgroundColor: currentTag ? `${tagOption?.color}10` : undefined,
                  }}
                >
                  {TAG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <p className="py-8 text-center text-neutral-500">
              {search ? 'No playlists match your search.' : 'No playlists found for this channel.'}
            </p>
          )}
        </div>
      )}

      {status && <p className="mt-4 text-sm text-saffron-500">{status}</p>}
    </div>
  );
}
