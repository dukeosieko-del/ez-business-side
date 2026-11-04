import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/affiliate/track';

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref') ?? '';
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(ref)) return NextResponse.redirect(new URL('/', request.url));

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;
  const response = NextResponse.redirect(new URL('/', request.url));

  try {
    const clickToken = await trackClick(ref, ip, userAgent);
    if (clickToken) {
      const host = request.nextUrl.hostname;
      response.cookies.set('janjez_affiliate_click', clickToken, {
        httpOnly: true, secure: request.nextUrl.protocol === 'https:',
        sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
        ...(host.endsWith('janjez.social') ? { domain: '.janjez.social' } : {}),
      });
    }
  } catch {
    // Attribution failure must not prevent the landing page from loading.
  }
  return response;
}
