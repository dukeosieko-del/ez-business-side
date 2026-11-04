export function generateAffiliateLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://business.janjez.social';
  return `${baseUrl.replace(/\/$/, '')}/api/affiliate/track/click?ref=${encodeURIComponent(code)}`;
}
