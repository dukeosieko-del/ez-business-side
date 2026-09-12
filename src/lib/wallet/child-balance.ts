import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function debitChildUser(childUserId: string, amount: number, currentBalance: number) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('child_users')
    .update({ balance: currentBalance - amount })
    .eq('id', childUserId)
    .eq('balance', currentBalance)
    .select()
    .single();
  if (error || !data) throw new Error('Concurrent modification');
  return data;
}

export async function refundChildUser(childUserId: string, amount: number) {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from('child_users')
    .select('balance')
    .eq('id', childUserId)
    .single();
  if (!user) throw new Error('Child user not found');

  const { data, error } = await supabase
    .from('child_users')
    .update({ balance: user.balance + amount })
    .eq('id', childUserId)
    .select()
    .single();
  if (error || !data) throw new Error('Refund failed');
  return data;
}