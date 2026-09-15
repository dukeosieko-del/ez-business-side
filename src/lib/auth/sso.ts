// Reads public env vars directly so this module is safe to import from client
// components. Server-only validation lives in @/lib/config/env and must never
// be bundled into the client.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://janjez.social';
const MAIN_API_URL =
  process.env.JANJEZ_MAIN_API_URL ?? 'https://janjez.social/api/business/v1';

export function getJanjezSsoUrl(returnTo: string): string {
  const params = new URLSearchParams({
    client_id: 'ez-business-side',
    redirect_uri: `${SITE_URL}/auth/callback`,
    return_to: returnTo,
    state: crypto.randomUUID(),
  });
  return `${MAIN_API_URL.replace('/api/business/v1', '')}/oauth/authorize?${params}`;
}