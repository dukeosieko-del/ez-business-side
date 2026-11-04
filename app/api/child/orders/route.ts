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

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey || idempotencyKey.length < 12 || idempotencyKey.length > 128) {
    return NextResponse.json({ error: 'A valid Idempotency-Key header is required' }, { status: 400 });
  }

  const session = await getChildSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { panel_id: panelRef, service_id, quantity, link } = parsed.data;
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(panelRef);

  const { data: panel } = await supabase
    .from('child_panels')
    .select('id, status')
    .eq(isUuid ? 'id' : 'subdomain', panelRef)
    .in('status', ['active', 'demo'])
    .maybeSingle();

  if (!panel || session.panel_id !== panel.id) {
    return NextResponse.json({ error: 'Cross-panel access denied' }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from('child_orders')
    .select('id, status, charge, created_at')
    .eq('idempotency_key', idempotencyKey)
    .eq('panel_id', panel.id)
    .eq('child_user_id', session.user_id)
    .maybeSingle();

  if (existing) return NextResponse.json({ success: true, data: existing, replayed: true });

  const { data: service, error: serviceError } = await supabase
    .from('child_services')
    .select('id, child_price, cost, child_min_quantity, child_max_quantity, is_visible, custom_name')
    .eq('id', service_id)
    .eq('panel_id', panel.id)
    .eq('is_visible', true)
    .maybeSingle();

  if (serviceError || !service) return NextResponse.json({ error: 'Service not found or unpublished' }, { status: 404 });
  if (quantity < service.child_min_quantity || quantity > service.child_max_quantity) {
    return NextResponse.json({ error: `Quantity must be between ${service.child_min_quantity} and ${service.child_max_quantity}` }, { status: 400 });
  }

  const totalCharge = Math.round(Number(service.child_price) * quantity * 100) / 100;

  // Demo orders are sample records only: no wallet debit and no provider submission.
  if (panel.status === 'demo') {
    const { data: demoOrder, error } = await supabase
      .from('child_orders')
      .insert({
        panel_id: panel.id,
        service_id,
        child_user_id: session.user_id,
        quantity,
        link,
        charge: totalCharge,
        cost: 0,
        markup: totalCharge,
        status: 'demo_completed',
        payment_method: 'demo',
        idempotency_key: idempotencyKey,
        metadata: { demo: true, provider_submission: false },
      })
      .select('id, status, charge, created_at')
      .single();

    if (error || !demoOrder) return NextResponse.json({ error: 'Could not save demo order' }, { status: 500 });
    return NextResponse.json({ success: true, mode: 'demo', data: demoOrder }, { status: 201 });
  }

  // Live orders remain blocked until a real provider adapter and settlement
  // callback are implemented and verified. Never charge for an unfulfilled order.
  return NextResponse.json({
    error: 'Live ordering is temporarily unavailable while provider fulfilment is being verified. Demo mode remains available.',
    code: 'LIVE_FULFILMENT_NOT_CONFIGURED',
  }, { status: 503 });
}