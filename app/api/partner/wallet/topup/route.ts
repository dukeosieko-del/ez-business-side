import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';

async function requirePartner(req: NextRequest): Promise<{ id: string } | null> {
  const token = req.cookies.get('jez_bs_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { id: session.partner_id } : null;
}

export async function POST(request: NextRequest) {
  const partner = await requirePartner(request);
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await request.json();
  if (typeof amount !== 'number' || amount < 50) {
    return NextResponse.json({ error: 'Minimum top-up is KES 50' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const idempotencyKey = randomUUID();

  // Idempotency: return existing transaction if key already used
  const { data: existing } = await supabase
    .from('wallet_transactions')
    .select('id')
    .eq('reference', idempotencyKey)
    .maybeSingle();

  if (existing) return NextResponse.json({ success: true, data: { alreadyExists: true, transactionId: existing.id } });

  const { data: partnerRow } = await supabase
    .from('partners')
    .select('wallet_balance')
    .eq('id', partner.id)
    .single();

  const before = partnerRow?.wallet_balance ?? 0;
  const after = before + amount;

  // Use atomic ledger RPC for integrity
  const { data, error } = await supabase.rpc('credit_wallet', {
    p_partner_id: partner.id,
    p_amount: amount,
    p_category: 'topup',
    p_reference: idempotencyKey,
    p_metadata: {},
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { alreadyExists: false, balance: data } });
}