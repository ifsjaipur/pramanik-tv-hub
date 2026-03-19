import { NextResponse } from 'next/server';
import { getLiveStreams, getUpcomingStreams } from '@/lib/youtube';

export async function GET() {
  try {
    const [liveVideos, upcomingVideos] = await Promise.all([
      getLiveStreams(),
      getUpcomingStreams(),
    ]);
    return NextResponse.json(
      {
        videos: liveVideos,
        upcoming: upcomingVideos,
        isLive: liveVideos.length > 0,
        hasUpcoming: upcomingVideos.length > 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      }
    );
  } catch {
    return NextResponse.json({ videos: [], upcoming: [], isLive: false, hasUpcoming: false }, { status: 200 });
  }
}
