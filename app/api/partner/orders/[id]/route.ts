import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/lib/config/env';

const SESSION_COOKIE = 'jez_bs_session';

async function getPartnerFromSession(req: NextRequest): Promise<{ partnerId: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { createHash } = await import('crypto');
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { partnerId: session.partner_id } : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await getPartnerFromSession(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from('child_orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Tenant isolation: verify the order belongs to a panel owned by this partner
  const { data: panel } = await supabase
    .from('child_panels')
    .select('id')
    .eq('id', order.panel_id)
    .eq('partner_id', partner.partnerId)
    .maybeSingle();

  if (!panel) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}