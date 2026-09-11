import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function trackClick(refCode: string, ip?: string, userAgent?: string) {
  const supabase = getSupabaseAdmin();
  const fingerprint = generateFingerprint(ip, userAgent);

  await supabase.from('affiliate_clicks').insert({
    ref_code: refCode,
    fingerprint,
    ip: ip ?? undefined,
    user_agent: userAgent ?? undefined,
    clicked_at: new Date().toISOString(),
  });
}

export function generateFingerprint(ip?: string, userAgent?: string): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${ip ?? 'unknown'}:${userAgent ?? 'unknown'}:${hex}`;
}