import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateChildApiKey } from '@/lib/api-keys/child';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const schema = z.object({
  service_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000),
  link: z.string().url().max(2048),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateChildApiKey(request, 'orders:create');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const idempotencyKey = request.headers.get('idempotency-key');
  if (!idempotencyKey || idempotencyKey.length < 12 || idempotencyKey.length > 128) {
    return NextResponse.json({ error: 'A valid Idempotency-Key header is required' }, { status: 400 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (auth.principal.mode !== 'demo') {
    return NextResponse.json({
      error: 'Live provider fulfilment and payment settlement are not yet enabled for API orders.',
      code: 'LIVE_FULFILMENT_NOT_CONFIGURED',
    }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('child_orders')
    .select('id, status, charge, created_at')
    .eq('idempotency_key', idempotencyKey)
    .eq('panel_id', auth.principal.panelId)
    .eq('child_user_id', auth.principal.childUserId)
    .maybeSingle();
  if (existing) return NextResponse.json({ success: true, replayed: true, data: existing });

  const { data: service } = await supabase
    .from('child_services')
    .select('id, child_price, child_min_quantity, child_max_quantity')
    .eq('id', parsed.data.service_id)
    .eq('panel_id', auth.principal.panelId)
    .eq('is_visible', true)
    .maybeSingle();
  if (!service) return NextResponse.json({ error: 'Service not found or unpublished' }, { status: 404 });
  const minQuantity = Number(service.child_min_quantity ?? 1);
  const maxQuantity = Number(service.child_max_quantity ?? 100000);
  if (parsed.data.quantity < minQuantity || parsed.data.quantity > maxQuantity) {
    return NextResponse.json({ error: 'Quantity is outside the allowed range' }, { status: 400 });
  }

  const charge = Math.round(Number(service.child_price) * parsed.data.quantity / 1000 * 100) / 100;
  const { data: order, error } = await supabase.from('child_orders').insert({
    panel_id: auth.principal.panelId,
    service_id: service.id,
    child_user_id: auth.principal.childUserId,
    quantity: parsed.data.quantity,
    link: parsed.data.link,
    charge,
    cost: 0,
    markup: charge,
    status: 'demo_completed',
    payment_method: 'demo_api',
    idempotency_key: idempotencyKey,
    metadata: { demo: true, source: 'api', provider_submission: false },
  }).select('id, status, charge, created_at').single();

  if (error || !order) return NextResponse.json({ error: 'Could not save demo order' }, { status: 500 });
  return NextResponse.json({ success: true, mode: 'demo', data: order }, { status: 201 });
}
