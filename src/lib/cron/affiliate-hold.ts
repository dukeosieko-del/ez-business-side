import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function releaseHeldCommissions(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  await supabase.from('affiliate_commissions').update({ status: 'completed' }).lte('hold_until', now);
}