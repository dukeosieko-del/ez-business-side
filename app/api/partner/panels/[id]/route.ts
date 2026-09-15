import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: panel, error: panelError } = await supabase
      .from('child_panels')
      .select('id, partner_id, subdomain, custom_domain, status, branding, copy, created_at, updated_at')
      .eq('id', id)
      .single();

    if (panelError || !panel) {
      return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
    }

    const { data: services } = await supabase
      .from('child_services')
      .select('*')
      .eq('panel_id', id)
      .order('display_order', { ascending: true });

    return NextResponse.json({ success: true, data: { panel, services: services ?? [] } });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Request failed' } }, { status: 500 });
  }
}