import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie')?.match(/jez_bs_session=([^;]+)/)?.[1];
    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenHash = createHash('sha256').update(cookie).digest('hex');
    const supabase = getSupabaseAdmin();
    const { data: session } = await supabase
      .from('sessions')
      .select('partner_id')
      .eq('token_hash', tokenHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: partner } = await supabase
      .from('partners')
      .select('id, janjez_user_id, janjez_email, display_name, status, onboarding_state')
      .eq('id', session.partner_id)
      .single();

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: partner });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}