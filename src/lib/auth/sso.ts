import { env } from '@/lib/config/env';

export function getJanjezSsoUrl(returnTo: string): string {
  const params = new URLSearchParams({
    client_id: 'ez-business-side',
    redirect_uri: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    return_to: returnTo,
    state: crypto.randomUUID(),
  });
  return `${env.JANJEZ_MAIN_API_URL.replace('/api/business/v1', '')}/oauth/authorize?${params}`;
}
