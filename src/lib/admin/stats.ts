import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function getAdminStats() {
  const supabase = getSupabaseAdmin();

  const { count: partners } = await supabase.from('partners').select('*', { count: 'exact' });
  const { count: orders } = await supabase.from('child_orders').select('*', { count: 'exact' });
  const { count: withdrawals } = await supabase.from('withdrawals').select('*', { count: 'exact' });
  const { count: transactions } = await supabase.from('wallet_transactions').select('*', { count: 'exact' });

  const { data: pendingWithdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('status', 'pending_admin_approval');

  return {
    partners: partners ?? 0,
    orders: orders ?? 0,
    withdrawals: withdrawals ?? 0,
    transactions: transactions ?? 0,
    pendingWithdrawals: pendingWithdrawals ?? [],
  };
}