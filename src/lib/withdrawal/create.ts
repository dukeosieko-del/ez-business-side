import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function createWithdrawal(params: {
  partnerId: string;
  amount: number;
  phone: string;
}) {
  if (params.amount < 500) throw new Error('Minimum withdrawal is KES 500');

  const fee = params.amount * 0.05;
  const netAmount = params.amount - fee;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('withdrawals').insert({
    partner_id: params.partnerId,
    amount: params.amount,
    fee,
    net_amount: netAmount,
    phone: params.phone,
    status: 'pending_admin_approval',
  }).select().single();

  if (error) throw error;
  return data;
}