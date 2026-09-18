import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';
import { getChildSession } from '@/lib/child-users/session';
import { callJanjez } from '@/lib/janjez-api/client';

const orderSchema = z.object({
  panel_id: z.string().uuid(),
  service_id: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  link: z.string().url(),
});

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) {
    return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
  }

  const session = await getChildSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotency: return existing order if key already used
  const { data: existing } = await supabase
    .from('child_orders')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, data: existing });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { panel_id, service_id, quantity, link } = parsed.data;

  // Tenant isolation: session user must belong to the panel
  if (session.panel_id !== panel_id) {
    return NextResponse.json({ error: 'Cross-panel access denied' }, { status: 403 });
  }

  // Verify service belongs to panel
  const { data: service } = await supabase
    .from('child_services')
    .select('id, name, child_price, cost')
    .eq('id', service_id)
    .eq('panel_id', panel_id)
    .single();
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  // Server-side price authority
  const totalCharge = Math.round(service.child_price * quantity * 100) / 100;
  const totalCost = Math.round(service.cost * quantity * 100) / 100;
  const markup = totalCharge - totalCost;

  // Check wallet balance
  const { data: wallet } = await supabase
    .from('child_wallets')
    .select('current_balance_minor')
    .eq('customer_id', session.user_id)
    .maybeSingle();

  const balanceMinor = wallet?.current_balance_minor ?? 0;
  const chargeMinor = Math.round(totalCharge * 100);

  if (balanceMinor < chargeMinor) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  // Reserve order with idempotency key
  const { data: reserved, error: reserveError } = await supabase
    .from('child_orders')
    .insert({
      panel_id, service_id, child_user_id: session.user_id, quantity, link,
      charge: totalCharge, cost: totalCost, markup,
      status: 'pending_payment',
      idempotency_key: idempotencyKey,
    })
    .select()
    .single();

  if (reserveError?.code === '23505') {
    const { data: winner } = await supabase
      .from('child_orders')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();
    return NextResponse.json({ success: true, data: winner });
  }

  if (reserveError || !reserved) {
    return NextResponse.json({ error: 'Failed to reserve order' }, { status: 500 });
  }

  // Debit wallet via immutable ledger
  try {
    await supabase.rpc('child_wallet_debit', {
      p_customer_id: session.user_id,
      p_amount_minor: chargeMinor,
      p_reference_type: 'order',
      p_reference_id: reserved.id,
      p_description: `Order ${reserved.id} for service ${service_id}`,
      p_created_by: 'system',
    });
  } catch (err) {
    await supabase.from('child_orders').update({ status: 'failed' }).eq('id', reserved.id);
    return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
  }

  // Submit to Janjez API via HMAC-signed call
  let externalOrderId: string | null = null;
  try {
    const janjezResult = await callJanjez<{ id: string }>({
      method: 'POST',
      path: '/orders',
      body: {
        panel_id, service_id, child_user_id: session.user_id, quantity, link,
        charge: totalCharge, cost: totalCost, markup,
        idempotency_key: idempotencyKey,
      },
      idempotencyKey,
    });
    externalOrderId = janjezResult.id;
  } catch {
    // Janjez unreachable — keep order in pending_submission for retry
    await supabase.from('child_orders').update({ status: 'pending_submission' }).eq('id', reserved.id);
    return NextResponse.json({
      success: true,
      data: { ...reserved, status: 'pending_submission' },
    });
  }

  await supabase.from('child_orders').update({
    status: 'submitted',
    external_order_id: externalOrderId,
  }).eq('id', reserved.id);

  return NextResponse.json({
    success: true,
    data: { ...reserved, status: 'submitted', external_order_id: externalOrderId },
  });
}