import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/affiliate/track';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');
  const fp = req.headers.get('x-tracking-fp');

  if (ref && fp) {
    const parts = fp.split(':');
    const ip = parts[0];
    const ua = parts.slice(1).join(':');
    trackClick(ref, ip, ua).catch(() => {});
  }

  return NextResponse.redirect(new URL('/', req.url));
}