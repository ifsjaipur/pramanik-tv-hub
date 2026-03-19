import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos } from '@/lib/youtube';
import { searchVideos } from '@/lib/search';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') ?? '';
  if (!query.trim()) {
    return NextResponse.json({ videos: [], query: '' });
  }

  try {
    const allVideos = await getAllVideos();
    const results = searchVideos(allVideos, query);

    return NextResponse.json(
      { videos: results.slice(0, 30), query },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch {
    return NextResponse.json({ videos: [], query, error: 'Search failed' }, { status: 500 });
  }
}
