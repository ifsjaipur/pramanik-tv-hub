import { NextRequest, NextResponse } from 'next/server';
import { getAudioTracksBySection } from '@/lib/cms';

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section');
  if (!section) return NextResponse.json([], { status: 400 });
  const tracks = await getAudioTracksBySection(section);
  return NextResponse.json(tracks);
}
