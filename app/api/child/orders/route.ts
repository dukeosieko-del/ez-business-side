import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';
import { getChildSession } from '@/lib/child-users/session';

const orderSchema = z.object({
  panel_id: z.string().min(1).max(120),
  service_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000),
  link: z.string().url().max(2048),
});

export async function GET() {
  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('child_orders')
    .select('id, service_id, quantity, link, charge, status, payment_method, created_at, completed_at')
    .eq('panel_id', session.panel_id).eq('child_user_id', session.user_id)
    .order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: 'Could not load order history' }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey || idempotencyKey.length < 12 || idempotencyKey.length > 128) {
    return NextResponse.json({ error: 'A valid Idempotency-Key header is required' }, { status: 400 });
  }
  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { panel_id: panelRef, service_id, quantity, link } = parsed.data;
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(panelRef);
  const { data: panel } = await supabase.from('child_panels').select('id, status')
    .eq(isUuid ? 'id' : 'subdomain', panelRef).in('status', ['active', 'demo']).maybeSingle();
  if (!panel || session.panel_id !== panel.id) return NextResponse.json({ error: 'Cross-panel access denied' }, { status: 403 });

  const { data: existing } = await supabase.from('child_orders')
    .select('id, status, charge, created_at')
    .eq('idempotency_key', idempotencyKey).eq('panel_id', panel.id).eq('child_user_id', session.user_id).maybeSingle();
  if (existing) return NextResponse.json({ success: true, data: existing, replayed: true });

  const { data: service, error: serviceError } = await supabase.from('child_services')
    .select('id, child_price, child_min_quantity, child_max_quantity')
    .eq('id', service_id).eq('panel_id', panel.id).eq('is_visible', true).maybeSingle();
  if (serviceError || !service) return NextResponse.json({ error: 'Service not found or unpublished' }, { status: 404 });
  const minQuantity = Number(service.child_min_quantity ?? 1);
  const maxQuantity = Number(service.child_max_quantity ?? 100000);
  if (quantity < minQuantity || quantity > maxQuantity) {
    return NextResponse.json({ error: `Quantity must be between ${minQuantity} and ${maxQuantity}` }, { status: 400 });
  }

  const totalCharge = Math.round(Number(service.child_price) * quantity / 1000 * 100) / 100;
  if (panel.status !== 'demo') {
    return NextResponse.json({
      error: 'Live ordering is temporarily unavailable while provider fulfilment and payment settlement are being verified.',
      code: 'LIVE_FULFILMENT_NOT_CONFIGURED',
    }, { status: 503 });
  }

  const { data: demoOrder, error } = await supabase.from('child_orders').insert({
    panel_id: panel.id, service_id, child_user_id: session.user_id, quantity, link,
    charge: totalCharge, cost: 0, markup: totalCharge, status: 'demo_completed',
    payment_method: 'demo', idempotency_key: idempotencyKey,
    metadata: { demo: true, provider_submission: false },
  }).select('id, status, charge, created_at').single();
  if (error || !demoOrder) return NextResponse.json({ error: 'Could not save demo order' }, { status: 500 });
  return NextResponse.json({ success: true, mode: 'demo', data: demoOrder }, { status: 201 });
}