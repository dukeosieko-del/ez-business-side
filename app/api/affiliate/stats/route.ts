import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

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

export async function GET(req: NextRequest) {
  const affiliateId = await requireAffiliateId(req);
  if (!affiliateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', affiliateId);

  const earned = commissions
    ?.filter((c: { status: string }) => c.status === 'completed')
    .reduce((sum: number, c: { amount?: number }) => sum + (c.amount ?? 0), 0) ?? 0;
  const pending = commissions
    ?.filter((c: { status: string }) => c.status === 'pending' || c.status === 'hold')
    .reduce((sum: number, c: { amount?: number }) => sum + (c.amount ?? 0), 0) ?? 0;
  const completed = earned;

  return NextResponse.json({
    success: true,
    data: { earned, pending, completed },
  });
}