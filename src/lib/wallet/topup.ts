import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function initiateTopup(partnerId: string, amount: number) {
  if (amount < 50) throw new Error('Minimum top-up is KES 50');

  const supabase = getSupabaseAdmin();
  const idempotencyKey = randomUUID();

  const { data: existing } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('reference', idempotencyKey)
    .single();

  if (existing) return { alreadyExists: true, transactionId: existing.id };

  const { data: partner } = await supabase
    .from('partners')
    .select('wallet_balance')
    .eq('id', partnerId)
    .single();

  const before = partner?.wallet_balance ?? 0;
  const after = before + amount;

  const { data, error } = await supabase.from('wallet_transactions').insert({
    partner_id: partnerId,
    amount,
    direction: 'credit',
    category: 'topup',
    reference: idempotencyKey,
    balance_before: before,
    balance_after: after,
  }).select().single();

  if (error) throw error;

  await supabase.from('partners').update({ wallet_balance: after }).eq('id', partnerId);

  return { alreadyExists: false, transactionId: data.id };
}