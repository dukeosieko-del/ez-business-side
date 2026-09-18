import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

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

export async function GET(request: NextRequest) {
  const partner = await requirePartner(request);
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('partners')
    .select('wallet_balance')
    .eq('id', partner.id)
    .single();

  return NextResponse.json({ success: true, data: { balance: data?.wallet_balance ?? 0 } });
}