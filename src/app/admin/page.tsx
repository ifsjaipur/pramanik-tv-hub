'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CmsSection, CmsChannel, CmsHighlight, CmsUnlistedVideo, Playlist } from '@/types';
import PlaylistTagsPanel from './PlaylistTagsPanel';
import ArticlesPanel from './ArticlesPanel';
import AudioPanel from './AudioPanel';
import PageLayoutPanel from './PageLayoutPanel';

type Tab = 'playlist-tags' | 'sections' | 'channels' | 'highlights' | 'unlisted' | 'articles' | 'audio' | 'page-layout' | 'export';

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('playlist-tags');

  const login = async () => {
    try {
      await api('auth', { method: 'POST', body: JSON.stringify({ secret }) });
      setAuthed(true);
      setError('');
    } catch {
      setError('Invalid secret');
    }
  };

  const logout = async () => {
    await api('auth', { method: 'DELETE' });
    setAuthed(false);
  };

  useEffect(() => {
    api('sections').then(() => setAuthed(true)).catch(() => {});
  }, []);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-800">
          <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Admin Login</h1>
          <input
            type="password"
            placeholder="Admin Secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <button onClick={login} className="mt-4 w-full rounded-lg bg-saffron-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-saffron-600">
            Login
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'playlist-tags', label: 'Playlist Tags' },
    { key: 'sections', label: 'Sections' },
    { key: 'channels', label: 'Channels' },
    { key: 'highlights', label: 'Highlights' },
    { key: 'unlisted', label: 'Unlisted Videos' },
    { key: 'articles', label: 'Articles' },
    { key: 'audio', label: 'Audio' },
    { key: 'page-layout', label: 'Page Layout' },
    { key: 'export', label: 'Export/Import' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Pramanik CMS</h1>
        <button onClick={logout} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">
          Logout
        </button>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-neutral-200 p-1 dark:bg-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'playlist-tags' && <PlaylistTagsPanel />}
      {tab === 'sections' && <SectionsPanel />}
      {tab === 'channels' && <ChannelsPanel />}
      {tab === 'highlights' && <HighlightsPanel />}
      {tab === 'unlisted' && <UnlistedPanel />}
      {tab === 'articles' && <ArticlesPanel />}
      {tab === 'audio' && <AudioPanel />}
      {tab === 'page-layout' && <PageLayoutPanel />}
      {tab === 'export' && <ExportPanel />}
    </div>
  );
}

// --- Sections Panel ---

const SECTION_CHANNELS = [
  { key: 'pramansagarji', label: 'Muni Pramansagar Ji' },
  { key: 'bestofshankasamadhan', label: 'Best of Shanka Samadhan' },
  { key: 'shankasamadhan', label: 'Shanka Samadhan' },
  { key: 'jainpathshala', label: 'Jain Pathshala' },
];

function SectionsPanel() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '', labelHi: '', type: 'playlist' as CmsSection['type'],
    playlistId: '', channelKey: SECTION_CHANNELS[0].key, categorySlug: '', limit: 12,
  });
  const [channelPlaylists, setChannelPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSections(await api<CmsSection[]>('sections')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load playlists when channel changes and type is playlist
  useEffect(() => {
    if (form.type !== 'playlist' || !form.channelKey) { setChannelPlaylists([]); return; }
    setLoadingPlaylists(true);
    api<Playlist[]>(`playlists?channel=${form.channelKey}`)
      .then((pls) => setChannelPlaylists(pls))
      .catch(() => setChannelPlaylists([]))
      .finally(() => setLoadingPlaylists(false));
  }, [form.type, form.channelKey]);

  const addSection = async () => {
    await api('sections', {
      method: 'POST',
      body: JSON.stringify({ ...form, order: sections.length, visible: true }),
    });
    setShowForm(false);
    setForm({ label: '', labelHi: '', type: 'playlist', playlistId: '', channelKey: SECTION_CHANNELS[0].key, categorySlug: '', limit: 12 });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    await api('sections', { method: 'DELETE', body: JSON.stringify({ id }) });
    load();
  };

  const moveSection = async (idx: number, dir: -1 | 1) => {
    const ids = sections.map((s) => s.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    await api('sections', { method: 'POST', body: JSON.stringify({ reorder: true, ids }) });
    load();
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Home Page Sections ({sections.length})
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
          + Add Section
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Label (English)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Label (Hindi)" value={form.labelHi} onChange={(e) => setForm({ ...form, labelHi: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CmsSection['type'] })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
              <option value="playlist">Playlist</option>
              <option value="channel">Channel</option>
              <option value="category">Category</option>
              <option value="highlights">Highlights</option>
            </select>
            {(form.type === 'playlist' || form.type === 'channel') && (
              <select value={form.channelKey} onChange={(e) => setForm({ ...form, channelKey: e.target.value, playlistId: '' })}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
                {SECTION_CHANNELS.map((ch) => (
                  <option key={ch.key} value={ch.key}>{ch.label}</option>
                ))}
              </select>
            )}
            {form.type === 'playlist' && (
              <select value={form.playlistId} onChange={(e) => {
                const pl = channelPlaylists.find((p) => p.id === e.target.value);
                setForm({ ...form, playlistId: e.target.value, label: form.label || (pl?.title ?? '') });
              }}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
                <option value="">{loadingPlaylists ? 'Loading...' : 'Select Playlist'}</option>
                {channelPlaylists.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.title} ({pl.videoCount} videos)</option>
                ))}
              </select>
            )}
            {form.type === 'category' && (
              <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
                <option value="">Select Category</option>
                <option value="discourse">Discourse</option>
                <option value="bhawna-yog">Bhawna Yog</option>
                <option value="swadhyay">Swadhyay</option>
                <option value="shanka-clips">Shanka Clips</option>
                <option value="live">Live</option>
                <option value="kids">Kids</option>
              </select>
            )}
            <input type="number" placeholder="Limit" value={form.limit} onChange={(e) => setForm({ ...form, limit: parseInt(e.target.value) || 12 })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addSection} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div>
              <span className="font-medium text-neutral-900 dark:text-white">{s.label}</span>
              {s.labelHi && <span className="ml-2 text-sm text-neutral-500">({s.labelHi})</span>}
              <span className="ml-3 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">{s.type}</span>
              {s.playlistId && <span className="ml-2 text-xs text-neutral-400">{s.playlistId}</span>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700">{'\u2191'}</button>
              <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}
                className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-700">{'\u2193'}</button>
              <button onClick={() => remove(s.id)}
                className="rounded px-2 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="py-8 text-center text-neutral-500">No sections configured. The home page will use auto-discovery mode.</p>
        )}
      </div>
    </div>
  );
}

// --- Channels Panel ---

function ChannelsPanel() {
  const [channels, setChannels] = useState<CmsChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    key: '', id: '', handle: '', name: '', nameHi: '',
    description: '', descriptionHi: '', color: '#E8730A',
    icon: 'Tv', priority: 10, isKids: false,
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setChannels(await api<CmsChannel[]>('channels')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addChannel = async () => {
    await api('channels', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ key: '', id: '', handle: '', name: '', nameHi: '', description: '', descriptionHi: '', color: '#E8730A', icon: 'Tv', priority: 10, isKids: false });
    load();
  };

  const remove = async (key: string) => {
    if (!confirm('Remove this channel?')) return;
    await api('channels', { method: 'DELETE', body: JSON.stringify({ key }) });
    load();
  };

  const browsePlaylists = async (channelKey: string) => {
    setSelectedChannel(channelKey);
    try {
      setPlaylists(await api<Playlist[]>(`playlists?channel=${channelKey}`));
    } catch {
      setPlaylists([]);
    }
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          YouTube Channels ({channels.length})
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
          + Add Channel
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Key (lowercase, no spaces)" value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s/g, '') })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="YouTube Channel ID (UC...)" value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Handle (@...)" value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Name (Hindi)" value={form.nameHi}
              onChange={(e) => setForm({ ...form, nameHi: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input type="color" value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-600" />
            <input type="number" placeholder="Priority (lower = first)" value={form.priority}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 10 })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.isKids} onChange={(e) => setForm({ ...form, isKids: e.target.checked })} />
              Kids channel
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addChannel} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {channels.map((ch) => (
          <div key={ch.key} className="rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ch.color }} />
                <span className="font-medium text-neutral-900 dark:text-white">{ch.name}</span>
                <span className="text-xs text-neutral-400">{ch.key}</span>
                <span className="hidden text-xs text-neutral-400 sm:inline">{ch.id}</span>
                {ch.isKids && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300">Kids</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => browsePlaylists(ch.key)}
                  className="rounded px-3 py-1 text-sm text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20">Playlists</button>
                <button onClick={() => remove(ch.key)}
                  className="rounded px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedChannel && playlists.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
            Playlists for {selectedChannel} ({playlists.length})
          </h3>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {playlists.map((pl) => (
              <div key={pl.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800/50">
                <div>
                  <span className="text-neutral-900 dark:text-white">{pl.title}</span>
                  <span className="ml-2 text-xs text-neutral-400">{pl.videoCount} videos</span>
                </div>
                <span className="text-xs text-neutral-400">{pl.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Highlights Panel ---

function HighlightsPanel() {
  const [highlights, setHighlights] = useState<CmsHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    videoId: '', title: '', description: '', startDate: '', endDate: '', priority: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setHighlights(await api<CmsHighlight[]>('highlights')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    await api('highlights', { method: 'POST', body: JSON.stringify({ ...form, active: true }) });
    setShowForm(false);
    setForm({ videoId: '', title: '', description: '', startDate: '', endDate: '', priority: 0 });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this highlight?')) return;
    await api('highlights', { method: 'DELETE', body: JSON.stringify({ id }) });
    load();
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Highlights ({highlights.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
          + Add Highlight
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="YouTube Video ID" value={form.videoId}
              onChange={(e) => setForm({ ...form, videoId: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Title / Event Name" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:col-span-2" />
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Start Date</label>
              <input type="datetime-local" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">End Date</label>
              <input type="datetime-local" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            </div>
            <input type="number" placeholder="Priority" value={form.priority}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={add} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {highlights.map((h) => (
          <div key={h.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div>
              <span className="font-medium text-neutral-900 dark:text-white">{h.title}</span>
              <span className="ml-2 text-xs text-neutral-400">Video: {h.videoId}</span>
              <span className="ml-2 text-xs text-neutral-400">
                {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}
              </span>
            </div>
            <button onClick={() => remove(h.id)}
              className="rounded px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
          </div>
        ))}
        {highlights.length === 0 && (
          <p className="py-8 text-center text-neutral-500">No highlights configured.</p>
        )}
      </div>
    </div>
  );
}

// --- Unlisted Videos Panel ---

function UnlistedPanel() {
  const [videos, setVideos] = useState<CmsUnlistedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    videoId: '', title: '', channelKey: 'pramansagarji', categorySlug: 'discourse', playlistId: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setVideos(await api<CmsUnlistedVideo[]>('unlisted')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    await api('unlisted', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ videoId: '', title: '', channelKey: 'pramansagarji', categorySlug: 'discourse', playlistId: '' });
    load();
  };

  const remove = async (videoId: string) => {
    if (!confirm('Remove this video?')) return;
    await api('unlisted', { method: 'DELETE', body: JSON.stringify({ videoId }) });
    load();
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Unlisted Videos ({videos.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
          + Add Video
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="YouTube Video ID" value={form.videoId}
              onChange={(e) => setForm({ ...form, videoId: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <select value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
              <option value="discourse">Discourse</option>
              <option value="bhawna-yog">Bhawna Yog</option>
              <option value="swadhyay">Swadhyay</option>
              <option value="shanka-clips">Shanka Clips</option>
              <option value="live">Live</option>
              <option value="kids">Kids</option>
            </select>
            <input placeholder="Playlist ID (optional)" value={form.playlistId}
              onChange={(e) => setForm({ ...form, playlistId: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={add} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {videos.map((v) => (
          <div key={v.videoId} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div>
              <span className="font-medium text-neutral-900 dark:text-white">{v.title}</span>
              <span className="ml-2 text-xs text-neutral-400">{v.videoId}</span>
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">{v.categorySlug}</span>
            </div>
            <button onClick={() => remove(v.videoId)}
              className="rounded px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Remove</button>
          </div>
        ))}
        {videos.length === 0 && (
          <p className="py-8 text-center text-neutral-500">No unlisted videos added.</p>
        )}
      </div>
    </div>
  );
}

// --- Export/Import Panel ---

function ExportPanel() {
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [status, setStatus] = useState('');

  const doExport = async () => {
    const data = await api('export');
    setExportData(JSON.stringify(data, null, 2));
    setStatus('Exported successfully');
  };

  const doImport = async () => {
    if (!confirm('This will merge with existing CMS data. Continue?')) return;
    try {
      const parsed = JSON.parse(importData);
      await api('export', { method: 'POST', body: JSON.stringify(parsed) });
      setStatus('Imported successfully');
      setImportData('');
    } catch {
      setStatus('Import failed - check JSON format');
    }
  };

  const copyExport = () => {
    navigator.clipboard.writeText(exportData);
    setStatus('Copied to clipboard');
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Export / Import CMS State</h2>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <button onClick={doExport} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">Export</button>
          {exportData && (
            <button onClick={copyExport} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400">Copy</button>
          )}
        </div>
        {exportData && (
          <textarea readOnly value={exportData} rows={12}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300" />
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">Import</h3>
        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste exported JSON here..."
          rows={8}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
        />
        <button onClick={doImport} disabled={!importData}
          className="mt-2 rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600 disabled:opacity-50">
          Import
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-saffron-500">{status}</p>}
    </div>
  );
}
