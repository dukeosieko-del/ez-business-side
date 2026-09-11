import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createAffiliate } from '@/lib/affiliate/register';
import { generateAffiliateCode } from '@/lib/affiliate/code';
import { generateAffiliateLink } from '@/lib/affiliate/link';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: partner } = await supabase
    .from('partners')
    .select('id, janjez_user_id, panel_id')
    .eq('id', sessionCookie)
    .single();

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  try {
    const affiliate = await createAffiliate(partner.janjez_user_id, partner.panel_id ?? partner.id);
    const link = generateAffiliateLink(affiliate.code);

    return NextResponse.json({ success: true, data: { affiliate, link } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}