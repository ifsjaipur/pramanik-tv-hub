import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getAudioTracks, saveAudioTrack, deleteAudioTrack } from '@/lib/cms';
import type { CmsAudioTrack } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const tracks = await getAudioTracks();
  const section = req.nextUrl.searchParams.get('section');
  if (section) return NextResponse.json(tracks.filter((t) => t.section === section));
  return NextResponse.json(tracks);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const track: CmsAudioTrack = {
    id: body.id || crypto.randomUUID(),
    title: body.title,
    titleHi: body.titleHi || '',
    description: body.description || '',
    descriptionHi: body.descriptionHi || '',
    audioUrl: body.audioUrl,
    duration: body.duration || '',
    section: body.section || 'general',
    order: body.order ?? 0,
    visible: body.visible !== false,
    createdAt: body.createdAt || new Date().toISOString(),
  };
  await saveAudioTrack(track);
  return NextResponse.json(track);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  await deleteAudioTrack(id);
  return NextResponse.json({ ok: true });
}
