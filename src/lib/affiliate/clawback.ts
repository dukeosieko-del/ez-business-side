import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function clawbackCommission(orderId: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('affiliate_commissions').update({ status: 'clawed_back' }).eq('order_id', orderId);
}