import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  await revalidatePath('/');
  await revalidatePath('/channel/[channelSlug]', 'page');
  await revalidatePath('/category/[categorySlug]', 'page');
  await revalidatePath('/video/[videoId]', 'page');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
