'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CmsArticle } from '@/types';

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

export default function ArticlesPanel() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', titleHi: '', slug: '', body: '', bodyHi: '',
    section: 'bhawna-yog', order: 0, visible: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setArticles(await api<CmsArticle[]>('articles')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ title: '', titleHi: '', slug: '', body: '', bodyHi: '', section: 'bhawna-yog', order: 0, visible: true });
    setEditId(null);
    setShowForm(false);
  };

  const save = async () => {
    const payload: Record<string, unknown> = { ...form };
    if (editId) payload.id = editId;
    await api('articles', { method: 'POST', body: JSON.stringify(payload) });
    resetForm();
    load();
  };

  const edit = (a: CmsArticle) => {
    setEditId(a.id);
    setForm({
      title: a.title, titleHi: a.titleHi, slug: a.slug,
      body: a.body, bodyHi: a.bodyHi, section: a.section,
      order: a.order, visible: a.visible,
    });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await api('articles', { method: 'DELETE', body: JSON.stringify({ id }) });
    load();
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Articles ({articles.length})
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-600">
          + Add Article
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
            <input placeholder="Slug (auto-generated if empty)" value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
            <select value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs text-neutral-500">Body (English) - Markdown supported</label>
            <textarea value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs text-neutral-500">Body (Hindi) - Markdown supported</label>
            <textarea value={form.bodyHi}
              onChange={(e) => setForm({ ...form, bodyHi: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white" />
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
        {articles.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div>
              <span className="font-medium text-neutral-900 dark:text-white">{a.title}</span>
              {a.titleHi && <span className="ml-2 text-sm text-neutral-500">({a.titleHi})</span>}
              <span className="ml-3 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">{a.section}</span>
              <span className="ml-2 text-xs text-neutral-400">/{a.slug}</span>
              {!a.visible && <span className="ml-2 text-xs text-red-400">hidden</span>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => edit(a)}
                className="rounded px-3 py-1 text-sm text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20">Edit</button>
              <button onClick={() => remove(a.id)}
                className="rounded px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="py-8 text-center text-neutral-500">No articles yet. Add text content like Bhawna Yog descriptions here.</p>
        )}
      </div>
    </div>
  );
}
