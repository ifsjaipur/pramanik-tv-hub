import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getChannels, saveChannel, deleteChannel } from '@/lib/cms';
import type { CmsChannel } from '@/types';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const channels = await getChannels();
  return NextResponse.json(channels);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const channel: CmsChannel = {
    key: body.key,
    id: body.id,
    handle: body.handle || '',
    name: body.name,
    nameHi: body.nameHi || '',
    description: body.description || '',
    descriptionHi: body.descriptionHi || '',
    color: body.color || '#E8730A',
    icon: body.icon || 'Tv',
    priority: body.priority || 10,
    isKids: body.isKids || false,
    addedAt: body.addedAt || new Date().toISOString(),
  };
  await saveChannel(channel);
  return NextResponse.json(channel);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { key } = await req.json();
  await deleteChannel(key);
  return NextResponse.json({ ok: true });
}
