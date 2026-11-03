import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (session) {
    const supabase = getSupabaseAdmin();
    const { data: partner } = await supabase
      .from('partners')
      .select('id, janjez_user_id, janjez_email, display_name, phone, status, onboarding_state')
      .eq('id', session.partner_id)
      .single();

    if (partner) {
      return NextResponse.json({ authenticated: true, partner });
    }
  }

  return NextResponse.json({
    authenticated: false,
    redirectTo: '/auth/sign-in',
  });
}