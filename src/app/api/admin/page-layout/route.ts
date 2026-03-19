import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPageLayout, savePageLayout } from '@/lib/cms';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const pageKey = req.nextUrl.searchParams.get('page');
  if (!pageKey) return NextResponse.json(null, { status: 400 });
  const layout = await getPageLayout(pageKey);
  return NextResponse.json(layout);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  await savePageLayout({
    pageKey: body.pageKey,
    blocks: body.blocks,
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
