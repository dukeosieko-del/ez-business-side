import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = sessionData.session.user.id;
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, janjez_user_id, affiliate_code, commission_rate, total_earned, total_pending, total_paid, mpesa_number, status, created_at, updated_at')
      .eq('janjez_user_id', userId)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: affiliate });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}