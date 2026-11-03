import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: partner, error: partnerError } = await supabase.from('partners')
    .select('id, janjez_user_id').eq('id', partnerId).maybeSingle();
  if (partnerError) return NextResponse.json({ error: 'Could not load partner profile' }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  const { data: affiliate, error: affiliateError } = await supabase.from('affiliates')
    .select('id, janjez_user_id, affiliate_code, commission_rate, total_earned, total_pending, total_paid, mpesa_number, status, created_at, updated_at')
    .eq('janjez_user_id', partner.janjez_user_id).maybeSingle();
  if (affiliateError) return NextResponse.json({ error: 'Could not load affiliate profile' }, { status: 500 });
  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: affiliate });
}
