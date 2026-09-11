import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function createTransaction(params: {
  partnerId: string;
  amount: number;
  direction: 'credit' | 'debit';
  category: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();

  const { data: partner } = await supabase
    .from('partners')
    .select('wallet_balance')
    .eq('id', params.partnerId)
    .single();

  const before = partner?.wallet_balance ?? 0;
  const after = params.direction === 'credit' ? before + params.amount : before - params.amount;

  const { data, error } = await supabase.from('wallet_transactions').insert({
    partner_id: params.partnerId,
    amount: params.amount,
    direction: params.direction,
    category: params.category,
    reference: params.reference ?? null,
    balance_before: before,
    balance_after: after,
    metadata: params.metadata ?? {},
  }).select().single();

  if (error) throw error;
  return data;
}