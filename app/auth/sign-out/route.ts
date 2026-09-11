import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL('/auth/sign-in', request.url));
}

export async function POST(request: NextRequest) {
  await destroySession();
  return NextResponse.json({ success: true });
}
