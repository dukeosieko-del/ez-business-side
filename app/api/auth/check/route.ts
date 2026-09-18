import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { verifyJanjezSession } from '@/lib/auth/verify';
import { env } from '@/lib/config/env';

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

  try {
    const cookieStore = await cookies();
    const janjezSessionCode = cookieStore.get('jez_session')?.value ?? '';

    if (!janjezSessionCode) {
      return NextResponse.json({
        authenticated: false,
        redirectTo: '/auth/sign-in',
      });
    }

    const verifyResult = await verifyJanjezSession(janjezSessionCode);

    if (!verifyResult.valid || !verifyResult.user) {
      return NextResponse.json({
        authenticated: false,
        redirectTo: '/auth/sign-in',
      });
    }

    const { janjez_user_id, email, full_name, phone } = verifyResult.user;

    const syncRes = await fetch(`${env.NEXT_PUBLIC_SITE_URL}/api/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ janjez_user_id, email, full_name, phone }),
      signal: AbortSignal.timeout(15000),
    });

    if (!syncRes.ok) {
      return NextResponse.json({
        authenticated: false,
        redirectTo: '/auth/sign-in',
      });
    }

    const syncJson = await syncRes.json();

    if (!syncJson.success || !syncJson.partner) {
      return NextResponse.json({
        authenticated: false,
        redirectTo: '/auth/sign-in',
      });
    }

    return NextResponse.json({
      authenticated: true,
      partner: syncJson.partner,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      redirectTo: '/auth/sign-in',
    });
  }
}