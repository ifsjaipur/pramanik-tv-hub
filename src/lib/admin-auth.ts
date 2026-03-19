import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL = 60 * 60 * 24; // 24 hours

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not set');
  return secret;
}

export function verifyAdminSecret(secret: string): boolean {
  return secret === getAdminSecret();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return false;
  return session.value === getAdminSecret();
}

export function createAdminSession(): NextResponse {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, getAdminSecret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TTL,
    path: '/',
  });
  return res;
}

export function clearAdminSession(): NextResponse {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return res;
}

// Middleware helper for API routes
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const session = req.cookies.get(COOKIE_NAME);
  if (!session || session.value !== getAdminSecret()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null; // authenticated
}
