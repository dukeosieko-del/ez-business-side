// Reads public env vars directly so this module is safe to import from client
// components. Server-only validation lives in @/lib/config/env and must never
// be bundled into the client.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://janjez.social';

export function getJanjezSsoUrl(returnTo: string): string {
  const params = new URLSearchParams({
    return_to: returnTo,
  });
  return `${SITE_URL}/auth/sign-in?${params}`;
}