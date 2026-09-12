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
  const { data: partner } = await supabase.from('partners').select('wallet_balance').eq('id', params.partnerId).single();
  const before = partner?.wallet_balance ?? 0;
  const after = params.direction === 'credit' ? before + params.amount : before - params.amount;

  if (params.direction === 'credit') {
    const { data, error } = await supabase.rpc('credit_wallet', {
      p_partner_id: params.partnerId,
      p_amount: params.amount,
      p_category: params.category,
      p_reference: params.reference ?? null,
      p_metadata: params.metadata ?? {},
    }).single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.rpc('debit_wallet', {
      p_partner_id: params.partnerId,
      p_amount: params.amount,
      p_category: params.category,
      p_reference: params.reference ?? null,
      p_metadata: params.metadata ?? {},
    }).single();
    if (error) throw error;
    return data;
  }
}