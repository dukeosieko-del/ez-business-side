import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function createPayout(affiliateId: string, amount: number) {
  const supabase = getSupabaseAdmin();

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .single();

  if (!affiliate) throw new Error('Affiliate not found');
  if (amount < 500) throw new Error('Minimum payout is KES 500');

  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const mpesaRef = `PAYOUT-${Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')}`;

  const { data, error } = await supabase.from('affiliate_payouts').insert({
    affiliate_id: affiliateId,
    amount,
    mpesa_ref: mpesaRef,
    status: 'pending_admin_approval',
  }).select().single();

  if (error) throw error;
  return data;
}