import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyHmacSignature } from '@/lib/hmac/verify';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['pending_submission', 'cancelled', 'failed'],
  pending_submission: ['submitted', 'failed'],
  submitted: ['processing', 'cancelled', 'failed'],
  processing: ['completed', 'partial', 'failed', 'cancelled'],
  completed: ['refunded'],
  partial: ['completed', 'failed', 'refunded'],
  cancelled: [],
  refunded: [],
  failed: [],
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-janjez-signature');
  const provider = 'janjez';
  const eventId = body.event_id ?? `${body.order_id}:${body.status}`;

  if (!signature || !await verifyHmacSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotency: check webhook_events for duplicate delivery
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id, processed')
    .eq('provider', provider)
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ success: true, cached: true });
  }

  // Record the event (upsert to handle race)
  const { data: event, error: eventError } = await supabase
    .from('webhook_events')
    .upsert({
      provider,
      event_id: eventId,
      event_type: body.event_type ?? 'order.status',
      payload_json: body,
      signature_valid: true,
      processed: false,
    }, { onConflict: 'provider,event_id' })
    .select()
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }

  const { order_id, status: newStatus } = body;

  // Fetch current order state
  const { data: order } = await supabase
    .from('child_orders')
    .select('id, status')
    .eq('id', order_id)
    .maybeSingle();

  if (!order) {
    await supabase.from('webhook_events').update({
      processed: true,
      processed_at: new Date().toISOString(),
      error: 'Order not found',
    }).eq('id', event.id);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Validate state transition
  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    await supabase.from('webhook_events').update({
      processed: true,
      processed_at: new Date().toISOString(),
      error: `Invalid transition: ${order.status} -> ${newStatus}`,
    }).eq('id', event.id);
    return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
  }

  // Apply status update
  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'completed' || newStatus === 'partial' || newStatus === 'failed' || newStatus === 'refunded') {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('child_orders')
    .update(updatePayload)
    .eq('id', order_id);

  if (updateError) {
    await supabase.from('webhook_events').update({
      processed: true,
      processed_at: new Date().toISOString(),
      error: updateError.message,
    }).eq('id', event.id);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Mark event as processed
  await supabase.from('webhook_events').update({
    processed: true,
    processed_at: new Date().toISOString(),
  }).eq('id', event.id);

  return NextResponse.json({ success: true });
}