import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/affiliate/track';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');

  if (ref) {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
    const ua = req.headers.get('user-agent') ?? undefined;
    trackClick(ref, ip, ua).catch(() => {});
  }

  return NextResponse.redirect(new URL('/', req.url));
}