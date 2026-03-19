import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPlaylistsByTag, savePlaylistTag } from '@/lib/cms';
import type { PlaylistTag } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const tag = req.nextUrl.searchParams.get('tag') as PlaylistTag | null;
  if (!tag) return NextResponse.json([], { status: 400 });
  const playlists = await getPlaylistsByTag(tag);
  playlists.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  return NextResponse.json(playlists);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const { orderedIds, tag } = body as { orderedIds: string[]; tag: PlaylistTag };
  const playlists = await getPlaylistsByTag(tag);
  for (const pl of playlists) {
    const idx = orderedIds.indexOf(pl.playlistId);
    if (idx !== -1) {
      pl.order = idx;
      await savePlaylistTag(pl);
    }
  }
  return NextResponse.json({ ok: true });
}
