import { NextRequest, NextResponse } from 'next/server';
import { resolveTenant } from '@/lib/tenant/resolve';

const PROTECTED_PATHS = ['/dashboard', '/partner', '/settings'];
const PUBLIC_PATHS = ['/', '/auth', '/_next', '/api/health', '/favicon.ico', '/api/affiliate'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];

  if (host.endsWith('.partners.janjez.social')) {
    const subdomain = host.replace('.partners.janjez.social', '');
    if (subdomain && !pathname.startsWith(`/${subdomain}`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const ref = request.nextUrl.searchParams.get('ref');
    if (ref) {
      const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined;
      const ua = request.headers.get('user-agent') ?? undefined;
      const origin = request.nextUrl.origin;
      const params = new URLSearchParams();
      params.set('ref', ref);
      if (ip) params.set('ip', ip);
      if (ua) params.set('ua', ua);
      fetch(`${origin}/api/affiliate/track/click?${params.toString()}`, {
        method: 'GET',
      }).catch(() => {});
    }
    return NextResponse.next();
  }

  const tenant = resolveTenant(request);
  if (tenant.type === 'child-panel') {
    const headers = new Headers(request.headers);
    headers.set('x-jez-panel-id', tenant.panelId);
    headers.set('x-jez-panel-subdomain', tenant.subdomain);
    return NextResponse.next({ request: { headers } });
  }

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const session = request.cookies.get('jez_bs_session');
    if (!session) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  return NextResponse.next();
}