import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getUnlistedVideos, saveUnlistedVideo, deleteUnlistedVideo } from '@/lib/cms';
import type { CmsUnlistedVideo } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const videos = await getUnlistedVideos();
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const video: CmsUnlistedVideo = {
    videoId: body.videoId,
    title: body.title,
    channelKey: body.channelKey,
    categorySlug: body.categorySlug,
    playlistId: body.playlistId,
    addedAt: body.addedAt || new Date().toISOString(),
  };
  await saveUnlistedVideo(video);
  return NextResponse.json(video);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { videoId } = await req.json();
  await deleteUnlistedVideo(videoId);
  return NextResponse.json({ ok: true });
}
