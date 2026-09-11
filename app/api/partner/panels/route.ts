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
      .select('id')
      .eq('janjez_user_id', userId)
      .single();

    if (!partner) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: panels } = await supabase
      .from('child_panels')
      .select('id, partner_id, subdomain, custom_domain, status, created_at')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, data: panels ?? [] });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}
