export function generateAffiliateLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://janjez.social';
  return `${baseUrl}/?ref=${code}`;
}