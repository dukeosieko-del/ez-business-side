import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { createPayout } from '@/lib/affiliate/payout';

async function requireAffiliateId(req: NextRequest): Promise<string | null> {
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

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('janjez_user_id', session.partner_id)
    .maybeSingle();

  return affiliate?.id ?? null;
}

export async function POST(req: NextRequest) {
  const affiliateId = await requireAffiliateId(req);
  if (!affiliateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await req.json();

  try {
    const payout = await createPayout(affiliateId, amount);
    return NextResponse.json({ success: true, data: payout });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}