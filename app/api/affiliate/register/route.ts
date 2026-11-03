import { NextRequest, NextResponse } from 'next/server';
import { createAffiliate } from '@/lib/affiliate/register';
import { generateAffiliateLink } from '@/lib/affiliate/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function POST(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase
    .from('partners')
    .select('janjez_user_id')
    .eq('id', partnerId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load partner profile' }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

  try {
    const affiliate = await createAffiliate(partner.janjez_user_id);
    const link = generateAffiliateLink(affiliate.affiliate_code);
    return NextResponse.json({ success: true, data: { affiliate, link } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Affiliate registration failed' }, { status: 500 });
  }
}
