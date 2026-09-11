import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function createPayout(affiliateId: string, amount: number) {
  const supabase = getSupabaseAdmin();

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .single();

  if (!affiliate) throw new Error('Affiliate not found');
  if (amount < 500) throw new Error('Minimum payout is KES 500');

  const mpesaRef = `PAYOUT-${randomBytes(8).toString('hex')}`;

  const { data: payout, error } = await supabase.from('affiliate_payouts').insert({
    affiliate_id: affiliateId,
    amount,
    mpesa_ref: mpesaRef,
    status: 'pending_admin_approval',
  }).select().single();

  if (error) throw error;
  return payout;
}