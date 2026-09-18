import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function getAuthenticatedPartnerFromCookie(cookie?: string): Promise<{ id: string; janjez_user_id: string } | null> {
  if (!cookie) return null;

  const tokenHash = createHash('sha256').update(cookie).digest('hex');
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
    .select('id, janjez_user_id')
    .eq('id', session.partner_id)
    .maybeSingle();

  return partner ?? null;
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie')?.match(/jez_bs_session=([^;]+)/)?.[1];
    const partner = await getAuthenticatedPartnerFromCookie(cookie);

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, janjez_user_id, affiliate_code, commission_rate, total_earned, total_pending, total_paid, mpesa_number, status, created_at, updated_at')
      .eq('janjez_user_id', partner.janjez_user_id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: affiliate });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}