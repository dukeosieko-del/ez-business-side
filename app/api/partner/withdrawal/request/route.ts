import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { createWithdrawal } from '@/lib/withdrawal/create';

async function requirePartner(req: NextRequest): Promise<{ id: string; phone: string } | null> {
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

  if (!session) return null;

  const { data: partner } = await supabase
    .from('partners')
    .select('id, phone')
    .eq('id', session.partner_id)
    .maybeSingle();

  return partner ?? null;
}

export async function POST(req: NextRequest) {
  const partner = await requirePartner(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await req.json();

  try {
    const withdrawal = await createWithdrawal({
      partnerId: partner.id,
      amount,
      phone: partner.phone ?? '',
    });
    return NextResponse.json({ success: true, data: withdrawal });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}