import { NextRequest } from 'next/server';

const PARTNER_HUB_DOMAIN = 'partners.janjez.social';

export type TenantResult =
  | { type: 'partner-hub' }
  | { type: 'child-panel'; panelId: string; subdomain: string }
  | { type: 'custom-domain'; hostname: string }
  | { type: 'unknown' };

export function resolveTenant(request: NextRequest): TenantResult {
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];

  if (host === PARTNER_HUB_DOMAIN || host === `www.${PARTNER_HUB_DOMAIN}`) {
    return { type: 'partner-hub' };
  }

  if (host.endsWith(`.${PARTNER_HUB_DOMAIN}`)) {
    const subdomain = host.slice(0, -1 * (PARTNER_HUB_DOMAIN.length + 1));
    return { type: 'child-panel', panelId: '', subdomain };
  }

  if (host === 'localhost' || host === '127.0.0.1') {
    return { type: 'partner-hub' };
  }

  return { type: 'custom-domain', hostname: host };
}
