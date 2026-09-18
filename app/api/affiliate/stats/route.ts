import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function requireAffiliateId(req: NextRequest): Promise<{ id: string; code: string } | null> {
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
    .select('id, affiliate_code')
    .eq('janjez_user_id', session.partner_id)
    .maybeSingle();

  return affiliate ? { id: affiliate.id, code: affiliate.affiliate_code } : null;
}

export async function GET(req: NextRequest) {
  const aff = await requireAffiliateId(req);
  if (!aff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('id, order_id, amount, status, created_at')
    .eq('affiliate_id', aff.id)
    .order('created_at', { ascending: false });

  const { data: clicks } = await supabase
    .from('affiliate_clicks')
    .select('id, ref_code, ip, user_agent, clicked_at, converted_order_id')
    .eq('ref_code', aff.code)
    .order('clicked_at', { ascending: false })
    .limit(20);

  const earned = commissions
    ?.filter((c: { status: string }) => c.status === 'completed')
    .reduce((sum: number, c: { amount?: number }) => sum + (c.amount ?? 0), 0) ?? 0;
  const pending = commissions
    ?.filter((c: { status: string }) => c.status === 'pending' || c.status === 'hold')
    .reduce((sum: number, c: { amount?: number }) => sum + (c.amount ?? 0), 0) ?? 0;

  const totalClicks = clicks?.length ?? 0;
  const totalConversions = commissions
    ?.filter((c: { status: string }) => c.status === 'completed' || c.status === 'pending')
    .length ?? 0;

  return NextResponse.json({
    success: true,
    data: {
      earned,
      pending,
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      commission_rate: 0.10,
      commissions: commissions ?? [],
      recent_clicks: clicks ?? [],
    },
  });
}