'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CmsAudioTrack } from '@/types';

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const SECTIONS = [
  { key: 'bhawna-yog', label: 'Bhawna Yog' },
  { key: 'swadhyay', label: 'Swadhyay' },
  { key: 'pravachan', label: 'Pravachan' },
  { key: 'general', label: 'General' },
];

export default function AudioPanel() {
  const [tracks, setTracks] = useState<CmsAudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', titleHi: '', description: '', descriptionHi: '',
    audioUrl: '', duration: '', section: 'bhawna-yog', order: 0, visible: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setTracks(await api<CmsAudioTrack[]>('audio')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ title: '', titleHi: '', description: '', descriptionHi: '', audioUrl: '', duration: '', section: 'bhawna-yog', order: 0, visible: true });
    setEditId(null);
    setShowForm(false);
  };

  const save = async () => {
    const payload: Record<string, unknown> = { ...form };
    if (editId) payload.id = editId;
    await api('audio', { method: 'POST', body: JSON.stringify(payload) });
    resetForm();
    load();
  };

  const edit = (t: CmsAudioTrack) => {
    setEditId(t.id);
    setForm({
      title: t.title, titleHi: t.titleHi, description: t.description,
      descriptionHi: t.descriptionHi, audioUrl: t.audioUrl, duration: t.duration,
      section: t.section, order: t.order, visible: t.visible,
    });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this audio track?')) return;
    await api('audio', { method: 'DELETE', body: JSON.stringify({ id }) });
    load();
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Audio Tracks ({tracks.length})
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
          + Add Audio
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Title (English)" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Title (Hindi)" value={form.titleHi}
              onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Description (English)" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Description (Hindi)" value={form.descriptionHi}
              onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <input placeholder="Audio URL (MP3 link)" value={form.audioUrl}
              onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:col-span-2" />
            <input placeholder="Duration (e.g. 12:30)" value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <select value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <input type="number" placeholder="Order" value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
              Visible
            </label>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={save} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
              {editId ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600 dark:text-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div>
              <span className="font-medium text-neutral-900 dark:text-white">{t.title}</span>
              {t.titleHi && <span className="ml-2 text-sm text-neutral-500">({t.titleHi})</span>}
              <span className="ml-3 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">{t.section}</span>
              {t.duration && <span className="ml-2 text-xs text-neutral-400">{t.duration}</span>}
              {!t.visible && <span className="ml-2 text-xs text-red-400">hidden</span>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => edit(t)}
                className="rounded px-3 py-1 text-sm text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20">Edit</button>
              <button onClick={() => remove(t.id)}
                className="rounded px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
            </div>
          </div>
        ))}
        {tracks.length === 0 && (
          <p className="py-8 text-center text-neutral-500">No audio tracks yet. Add MP3 audio commands here.</p>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">How to host MP3 files</h3>
        <ul className="mt-2 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <li>1. Upload MP3 files to any file hosting service (Google Drive, Dropbox, your VPS)</li>
          <li>2. Get the direct download/stream URL</li>
          <li>3. Paste the URL in the Audio URL field above</li>
          <li>4. For Google Drive: use format https://drive.google.com/uc?id=FILE_ID&export=download</li>
        </ul>
      </div>
    </div>
  );
}
