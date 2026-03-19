import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPlaylistTags, getPlaylistsByTag, savePlaylistTag, deletePlaylistTag, bulkSavePlaylistTags } from '@/lib/cms';
import type { CmsPlaylistTag, PlaylistTag } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const tag = req.nextUrl.searchParams.get('tag') as PlaylistTag | null;
  const tags = tag ? await getPlaylistsByTag(tag) : await getPlaylistTags();
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();

  if (body.bulk && Array.isArray(body.tags)) {
    const tags: CmsPlaylistTag[] = body.tags.map((t: CmsPlaylistTag) => ({
      playlistId: t.playlistId,
      playlistTitle: t.playlistTitle,
      channelKey: t.channelKey,
      tag: t.tag,
      taggedAt: t.taggedAt || new Date().toISOString(),
      showOnHome: t.showOnHome ?? false,
    }));
    await bulkSavePlaylistTags(tags);
    return NextResponse.json({ ok: true, count: tags.length });
  }

  const tag: CmsPlaylistTag = {
    playlistId: body.playlistId,
    playlistTitle: body.playlistTitle,
    channelKey: body.channelKey,
    tag: body.tag,
    taggedAt: body.taggedAt || new Date().toISOString(),
    showOnHome: body.showOnHome ?? false,
  };
  await savePlaylistTag(tag);
  return NextResponse.json(tag);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { playlistId } = await req.json();
  await deletePlaylistTag(playlistId);
  return NextResponse.json({ ok: true });
}
