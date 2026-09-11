import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function payoutViaMpesa(phone: string, amount: number): Promise<string> {
  // In production, integrate with M-Pesa B2C API
  const transactionId = `B2C-${Date.now()}`;

  const supabase = getSupabaseAdmin();
  await supabase.from('payout_transactions').insert({
    phone,
    amount,
    transaction_id: transactionId,
    status: 'processed',
  });

  return transactionId;
}