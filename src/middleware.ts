import { NextRequest, NextResponse } from 'next/server';
import { resolveTenant } from '@/lib/tenant/resolve';

const PROTECTED_PATHS = ['/dashboard', '/partner', '/settings'];
const PUBLIC_PATHS = ['/', '/auth', '/_next', '/api/health', '/favicon.ico'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
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
