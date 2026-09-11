import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function approveWithdrawal(withdrawalId: string) {
  const supabase = getSupabaseAdmin();

  const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', withdrawalId).single();
  if (!withdrawal) throw new Error('Withdrawal not found');
  if (withdrawal.status !== 'pending_admin_approval') throw new Error('Withdrawal not in pending state');

  // Debit partner wallet via RPC
  // Note: In production this would call the debit_wallet RPC
  const { error: debitError } = await supabase.rpc('debit_wallet', {
    p_partner_id: withdrawal.partner_id,
    p_amount: withdrawal.amount,
    p_category: 'withdrawal',
    p_reference: `withdrawal-${withdrawalId}`,
  });

  if (debitError) throw debitError;

  await supabase.from('withdrawals').update({
    status: 'approved',
    approved_at: new Date().toISOString(),
  }).eq('id', withdrawalId);

  return { success: true };
}