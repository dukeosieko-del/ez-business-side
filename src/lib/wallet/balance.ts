import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function getBalance(partnerId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('partners')
    .select('wallet_balance')
    .eq('id', partnerId)
    .single();
  return data?.wallet_balance ?? 0;
}