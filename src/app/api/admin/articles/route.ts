import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getArticles, saveArticle, deleteArticle } from '@/lib/cms';
import type { CmsArticle } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const articles = await getArticles();
  const section = req.nextUrl.searchParams.get('section');
  if (section) return NextResponse.json(articles.filter((a) => a.section === section));
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const now = new Date().toISOString();
  const article: CmsArticle = {
    id: body.id || crypto.randomUUID(),
    slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: body.title,
    titleHi: body.titleHi || '',
    body: body.body || '',
    bodyHi: body.bodyHi || '',
    section: body.section || 'general',
    order: body.order ?? 0,
    visible: body.visible !== false,
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  await saveArticle(article);
  return NextResponse.json(article);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  await deleteArticle(id);
  return NextResponse.json({ ok: true });
}
