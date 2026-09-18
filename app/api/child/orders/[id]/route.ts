import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getChildSession } from '@/lib/child-users/session';

// Fields that must never be exposed to Child Panel customers
const PROVIDER_FIELDS = new Set([
  'provider_id', 'provider_service_id', 'provider_rate', 'provider_credentials',
  'provider_order_id', 'external_provider_id',
]);

function sanitizeOrder(order: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(order)) {
    if (!PROVIDER_FIELDS.has(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getChildSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from('child_orders')
    .select('*')
    .eq('id', id)
    .eq('panel_id', session.panel_id)
    .eq('child_user_id', session.user_id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: sanitizeOrder(order) });
}