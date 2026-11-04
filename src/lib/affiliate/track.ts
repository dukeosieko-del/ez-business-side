import { createHash, randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function trackClick(refCode: string, ip?: string, userAgent?: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: affiliate, error: affiliateError } = await supabase.from('affiliates')
    .select('id').eq('affiliate_code', refCode).maybeSingle();
  if (affiliateError || !affiliate) return null;

  const clickToken = randomUUID();
  const { error } = await supabase.from('affiliate_clicks').insert({
    affiliate_id: affiliate.id,
    click_token: clickToken,
    ref_code: refCode,
    fingerprint: generateFingerprint(ip, userAgent),
    ip: ip ?? null,
    user_agent: userAgent ?? null,
    clicked_at: new Date().toISOString(),
  });
  if (error) throw new Error('Could not record affiliate click');
  return clickToken;
}

export function generateFingerprint(ip?: string, userAgent?: string): string {
  return createHash('sha256').update([ip ?? 'unknown', userAgent ?? 'unknown'].join('|')).digest('hex');
}
