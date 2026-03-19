import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getHighlights, saveHighlight, deleteHighlight } from '@/lib/cms';
import type { CmsHighlight } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const highlights = await getHighlights();
  return NextResponse.json(highlights);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const highlight: CmsHighlight = {
    id: body.id || crypto.randomUUID(),
    videoId: body.videoId,
    title: body.title,
    description: body.description || '',
    startDate: body.startDate,
    endDate: body.endDate,
    priority: body.priority || 0,
    active: body.active !== false,
  };
  await saveHighlight(highlight);
  return NextResponse.json(highlight);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  await deleteHighlight(id);
  return NextResponse.json({ ok: true });
}
