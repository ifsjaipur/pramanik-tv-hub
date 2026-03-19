import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSecret, createAdminSession, clearAdminSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();
    if (!verifyAdminSecret(secret)) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
    return createAdminSession();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  return clearAdminSession();
}
