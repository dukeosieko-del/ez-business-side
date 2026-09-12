import { env } from '@/lib/config/env';

export function getJanjezSsoUrl(returnTo: string): string {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? 'https://janjez.social';
  const apiUrl = env.JANJEZ_MAIN_API_URL ?? 'https://janjez.social/api/business/v1';
  const params = new URLSearchParams({
    client_id: 'ez-business-side',
    redirect_uri: `${siteUrl}/auth/callback`,
    return_to: returnTo,
    state: crypto.randomUUID(),
  });
  return `${apiUrl.replace('/api/business/v1', '')}/oauth/authorize?${params}`;
}
