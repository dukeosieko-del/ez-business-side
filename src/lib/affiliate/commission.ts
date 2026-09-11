import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function findClickByFingerprint(fingerprint: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('affiliate_clicks')
    .select('*')
    .eq('fingerprint', fingerprint)
    .order('clicked_at', { ascending: false })
    .limit(1);

  return data?.[0] ?? null;
}

export async function isWithinHoldPeriod(clickedAt: string, holdDays = 14): Promise<boolean> {
  const clickDate = new Date(clickedAt).getTime();
  const now = Date.now();
  const daysDiff = (now - clickDate) / (1000 * 60 * 60 * 24);
  return daysDiff < holdDays;
}

export function calculateCommission(orderValue: number, rate = 0.1): number {
  return orderValue * rate;
}