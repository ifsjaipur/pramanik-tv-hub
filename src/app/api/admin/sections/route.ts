import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSections, saveSection, deleteSection, reorderSections } from '@/lib/cms';
import type { CmsSection } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const sections = await getSections();
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();

  if (body.reorder && Array.isArray(body.ids)) {
    await reorderSections(body.ids);
    return NextResponse.json({ ok: true });
  }

  const section: CmsSection = {
    id: body.id || crypto.randomUUID(),
    label: body.label,
    labelHi: body.labelHi || '',
    type: body.type,
    playlistId: body.playlistId,
    channelKey: body.channelKey,
    categorySlug: body.categorySlug,
    limit: body.limit || 12,
    order: body.order || 0,
    visible: body.visible !== false,
  };
  await saveSection(section);
  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  await deleteSection(id);
  return NextResponse.json({ ok: true });
}
