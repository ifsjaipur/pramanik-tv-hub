import { NextRequest, NextResponse } from 'next/server';
import type { ChannelKey } from '@/types';
import { getAllVideos, getVideosByCategory, getVideosByChannel } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const channel = searchParams.get('channel') as ChannelKey | null;
  const category = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '24')));

  try {
    let videos;
    if (channel) {
      videos = await getVideosByChannel(channel);
    } else if (category) {
      videos = await getVideosByCategory(category);
    } else {
      videos = await getAllVideos();
    }

    const total = videos.length;
    const start = (page - 1) * pageSize;
    const paginatedVideos = videos.slice(start, start + pageSize);
    const hasNext = start + pageSize < total;

    return NextResponse.json(
      {
        videos: paginatedVideos,
        total,
        page,
        pageSize,
        nextPage: hasNext ? page + 1 : null,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
