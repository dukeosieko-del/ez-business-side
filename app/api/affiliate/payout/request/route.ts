import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';
import { createPayout } from '@/lib/affiliate/payout';

export async function POST(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { amount?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body.amount !== 'number' || !Number.isSafeInteger(body.amount) || body.amount < 500) {
    return NextResponse.json({ error: 'Minimum payout is KES 500; enter a whole KES amount' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase.from('partners')
    .select('janjez_user_id').eq('id', partnerId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load partner profile' }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

  const { data: affiliate, error: affiliateError } = await supabase.from('affiliates')
    .select('id').eq('janjez_user_id', partner.janjez_user_id).maybeSingle();
  if (affiliateError) return NextResponse.json({ error: 'Could not load affiliate profile' }, { status: 500 });
  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });

  try {
    const payout = await createPayout(affiliate.id, body.amount);
    return NextResponse.json({ success: true, data: payout }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Payout request failed' }, { status: 400 });
  }
}
