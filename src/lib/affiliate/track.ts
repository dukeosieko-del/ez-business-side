import { createHash } from 'crypto';
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
  const parts = [ip ?? 'unknown', userAgent ?? 'unknown'];
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32);
}