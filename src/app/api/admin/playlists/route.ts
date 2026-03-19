import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { fetchChannelPlaylists } from '@/lib/youtube';
import type { ChannelKey } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const channelKey = req.nextUrl.searchParams.get('channel') as ChannelKey | null;
  if (!channelKey) {
    return NextResponse.json({ error: 'channel parameter required' }, { status: 400 });
  }

  try {
    const playlists = await fetchChannelPlaylists(channelKey);
    return NextResponse.json(playlists);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Admin Playlists API] Error for channel', channelKey, ':', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
