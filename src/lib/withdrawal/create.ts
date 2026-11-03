import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function createWithdrawal(params: { partnerId: string; amount: number; mpesaNumber: string }) {
  if (!Number.isSafeInteger(params.amount) || params.amount < 500) {
    throw new Error('Withdrawal amount must be a whole KES amount of at least 500');
  }
  const mpesaNumber = params.mpesaNumber.trim();
  if (!mpesaNumber) throw new Error('Add a verified M-Pesa number before requesting a withdrawal');

  const feePercent = Number(process.env.WITHDRAWAL_FEE_PERCENT ?? '5');
  if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent >= 100) {
    throw new Error('Withdrawal fee configuration is invalid');
  }
  const fee = Math.round(params.amount * feePercent) / 100;
  const netAmount = params.amount - fee;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({ partner_id: params.partnerId, amount: params.amount, fee, net_amount: netAmount, mpesa_number: mpesaNumber, status: 'pending' })
    .select('id, partner_id, amount, fee, net_amount, mpesa_number, status, created_at')
    .single();
  if (error) throw new Error('Could not create withdrawal request');
  return data;
}
