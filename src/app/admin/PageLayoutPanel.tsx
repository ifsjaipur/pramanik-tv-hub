'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CmsPageLayout, PageBlockType, CmsPlaylistTag, PlaylistTag } from '@/types';

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const PAGES = [
  { key: 'bhawna-yog', label: 'Bhawna Yog', tags: ['bhawna-yog', 'bhawna-yog-experiences'] as PlaylistTag[] },
  { key: 'swadhyay', label: 'Swadhyay', tags: ['swadhyay'] as PlaylistTag[] },
  { key: 'pravachan', label: 'Pravachan', tags: ['pravachan-monthly', 'pravachan-special'] as PlaylistTag[] },
];

const BLOCK_LABELS: Record<PageBlockType, string> = {
  articles: 'Articles (Text Pages)',
  audio: 'Audio Tracks (MP3)',
  videos: 'Video Playlists',
  experiences: 'Experiences (Videos)',
};

export default function PageLayoutPanel() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0].key);
  const [layout, setLayout] = useState<CmsPageLayout | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [playlists, setPlaylists] = useState<CmsPlaylistTag[]>([]);
  const [loadingPl, setLoadingPl] = useState(false);
  const [savingPl, setSavingPl] = useState(false);

  const page = PAGES.find((p) => p.key === selectedPage)!;

  const load = useCallback(async () => {
    setLoading(true);
    setStatus('');
    try {
      const data = await api<CmsPageLayout>(`page-layout?page=${selectedPage}`);
      setLayout(data);
    } catch {
      setLayout(null);
    }
    setLoading(false);
  }, [selectedPage]);

  const loadPlaylists = useCallback(async () => {
    setLoadingPl(true);
    try {
      const allPl: CmsPlaylistTag[] = [];
      for (const tag of page.tags) {
        const pls = await api<CmsPlaylistTag[]>(`playlist-order?tag=${tag}`);
        allPl.push(...pls);
      }
      allPl.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setPlaylists(allPl);
    } catch {
      setPlaylists([]);
    }
    setLoadingPl(false);
  }, [page.tags]);

  useEffect(() => { load(); loadPlaylists(); }, [load, loadPlaylists]);

  const moveBlock = (idx: number, dir: -1 | 1) => {
    if (!layout) return;
    const blocks = [...layout.blocks];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= blocks.length) return;
    [blocks[idx], blocks[swapIdx]] = [blocks[swapIdx], blocks[idx]];
    setLayout({ ...layout, blocks });
  };

  const toggleBlock = (block: PageBlockType) => {
    if (!layout) return;
    const blocks = layout.blocks.includes(block)
      ? layout.blocks.filter((b) => b !== block)
      : [...layout.blocks, block];
    setLayout({ ...layout, blocks });
  };

  const save = async () => {
    if (!layout) return;
    setSaving(true);
    try {
      await api('page-layout', {
        method: 'POST',
        body: JSON.stringify({ pageKey: selectedPage, blocks: layout.blocks }),
      });
      setStatus('Layout saved!');
    } catch {
      setStatus('Error saving layout');
    }
    setSaving(false);
  };

  const movePlaylist = (idx: number, dir: -1 | 1) => {
    const pls = [...playlists];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= pls.length) return;
    [pls[idx], pls[swapIdx]] = [pls[swapIdx], pls[idx]];
    setPlaylists(pls);
  };

  const savePlaylists = async () => {
    setSavingPl(true);
    try {
      const byTag: Record<string, string[]> = {};
      playlists.forEach((pl) => {
        if (!byTag[pl.tag]) byTag[pl.tag] = [];
        byTag[pl.tag].push(pl.playlistId);
      });
      for (const [tag, orderedIds] of Object.entries(byTag)) {
        await api('playlist-order', {
          method: 'POST',
          body: JSON.stringify({ tag, orderedIds }),
        });
      }
      setStatus('Playlist order saved!');
    } catch {
      setStatus('Error saving playlist order');
    }
    setSavingPl(false);
  };

  const allBlocks: PageBlockType[] = ['articles', 'audio', 'videos', 'experiences'];
  const unusedBlocks = allBlocks.filter((b) => !layout?.blocks.includes(b));

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
        Page Content Layout
      </h2>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        Control the order of content blocks and playlists on each section page.
      </p>

      <div className="mb-4">
        <label className="mb-1 block text-xs text-neutral-500">Select Page</label>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
        >
          {PAGES.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-neutral-500">Loading...</p>}

      {layout && !loading && (
        <>
          <div className="mb-2 text-xs font-medium text-neutral-500 uppercase">Content Blocks (in order)</div>
          <div className="space-y-2 mb-4">
            {layout.blocks.map((block, i) => (
              <div
                key={block}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-100 text-xs font-bold text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
                    {i + 1}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {BLOCK_LABELS[block]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => moveBlock(i, -1)} disabled={i === 0}
                    className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700">{'\u2191'}</button>
                  <button onClick={() => moveBlock(i, 1)} disabled={i === layout.blocks.length - 1}
                    className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700">{'\u2193'}</button>
                  <button onClick={() => toggleBlock(block)}
                    className="rounded px-2 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Hide</button>
                </div>
              </div>
            ))}
            {layout.blocks.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400">No blocks active.</p>
            )}
          </div>

          {unusedBlocks.length > 0 && (
            <>
              <div className="mb-2 text-xs font-medium text-neutral-500 uppercase">Hidden Blocks</div>
              <div className="space-y-2 mb-4">
                {unusedBlocks.map((block) => (
                  <div key={block}
                    className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-800/50">
                    <span className="text-neutral-500 dark:text-neutral-400">{BLOCK_LABELS[block]}</span>
                    <button onClick={() => toggleBlock(block)}
                      className="rounded px-3 py-1 text-sm text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20">Show</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center gap-3 mb-8">
            <button onClick={save} disabled={saving}
              className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Block Layout'}
            </button>
          </div>

          {/* Playlist ordering */}
          <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
            <div className="mb-2 text-xs font-medium text-neutral-500 uppercase">
              Playlist Order ({playlists.length} playlists)
            </div>
            <p className="mb-3 text-xs text-neutral-400">
              Reorder playlists within this page. Move up/down to change display order.
            </p>

            {loadingPl ? (
              <p className="text-neutral-500">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">No tagged playlists for this page.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {playlists.map((pl, i) => (
                  <div key={pl.playlistId}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {i + 1}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white truncate">
                        {pl.playlistTitle}
                      </span>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                        {pl.tag}
                      </span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => movePlaylist(i, -1)} disabled={i === 0}
                        className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700">{'\u2191'}</button>
                      <button onClick={() => movePlaylist(i, 1)} disabled={i === playlists.length - 1}
                        className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700">{'\u2193'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {playlists.length > 0 && (
              <button onClick={savePlaylists} disabled={savingPl}
                className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-50">
                {savingPl ? 'Saving...' : 'Save Playlist Order'}
              </button>
            )}
          </div>

          {status && <p className="mt-4 text-sm text-saffron-500">{status}</p>}
        </>
      )}
    </div>
  );
}
