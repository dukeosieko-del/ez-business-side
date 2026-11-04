import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: partner, error: partnerError } = await supabase.from('partners')
    .select('janjez_user_id').eq('id', partnerId).maybeSingle();
  if (partnerError) return NextResponse.json({ error: 'Could not load partner profile' }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  const { data: affiliate, error: affiliateError } = await supabase.from('affiliates')
    .select('id, affiliate_code, commission_rate').eq('janjez_user_id', partner.janjez_user_id).maybeSingle();
  if (affiliateError) return NextResponse.json({ error: 'Could not load affiliate profile' }, { status: 500 });
  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });

  const [{ data: commissions, error: commissionsError }, { data: clicks, error: clicksError }, { count: totalClicks, error: countError }] = await Promise.all([
    supabase.from('affiliate_commissions').select('id, order_id, amount, status, created_at')
      .eq('affiliate_id', affiliate.id).order('created_at', { ascending: false }),
    supabase.from('affiliate_clicks').select('id, ref_code, clicked_at, converted_order_id')
      .eq('ref_code', affiliate.affiliate_code).order('clicked_at', { ascending: false }).limit(20),
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('ref_code', affiliate.affiliate_code),
  ]);
  if (commissionsError || clicksError || countError) {
    return NextResponse.json({ error: 'Could not load affiliate statistics' }, { status: 500 });
  }
  const earned = (commissions ?? []).filter((item) => item.status === 'completed')
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const pending = (commissions ?? []).filter((item) => item.status === 'pending' || item.status === 'hold')
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const totalConversions = (commissions ?? []).filter((item) => item.status === 'completed' || item.status === 'pending').length;
  return NextResponse.json({ success: true, data: {
    earned, pending, total_clicks: totalClicks ?? 0, total_conversions: totalConversions,
    commission_rate: Number(affiliate.commission_rate ?? 0.1), commissions: commissions ?? [], recent_clicks: clicks ?? [],
  }});
}
