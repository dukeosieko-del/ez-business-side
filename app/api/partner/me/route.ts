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
    const { data: partner } = await supabase
      .from('partners')
      .select('id, janjez_user_id, janjez_email, display_name, status, onboarding_state')
      .eq('janjez_user_id', userId)
      .single();

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: partner });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}
