import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { exportCmsState, importCmsState } from '@/lib/cms';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const state = await exportCmsState();
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  await importCmsState(body);
  return NextResponse.json({ ok: true });
}
