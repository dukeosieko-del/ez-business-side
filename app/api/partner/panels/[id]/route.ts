import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function getPartnerFromRequest(req: NextRequest): Promise<{ id: string } | null> {
  const cookie = req.cookies.get('jez_bs_session')?.value;
  if (!cookie) return null;
  const tokenHash = createHash('sha256').update(cookie).digest('hex');

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { id: session.partner_id } : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await getPartnerFromRequest(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: panel, error: panelError } = await supabase
      .from('child_panels')
      .select('id, partner_id, subdomain, custom_domain, status, branding, copy, created_at, updated_at')
      .eq('id', id)
      .eq('partner_id', partner.id)
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