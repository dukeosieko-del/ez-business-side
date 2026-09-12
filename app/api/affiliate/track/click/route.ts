import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/affiliate/track';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');
  const ip = searchParams.get('ip') ?? undefined;
  const ua = searchParams.get('ua') ?? undefined;

  if (ref) {
    trackClick(ref, ip, ua).catch(() => {});
  }

  return NextResponse.redirect(new URL('/', req.url));
}