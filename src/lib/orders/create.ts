import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const createOrderSchema = z.object({
  panel_id: z.string().uuid(),
  service_id: z.string().uuid(),
  child_user_id: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  link: z.string().url(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { panel_id, service_id, child_user_id, quantity, link } = parsed.data;
  const supabase = getSupabaseAdmin();

  const { data: service } = await supabase
    .from('child_services')
    .select('id, name, child_price, cost')
    .eq('id', service_id)
    .eq('panel_id', panel_id)
    .single();
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const { data: childUser } = await supabase
    .from('child_users')
    .select('id, panel_id, balance')
    .eq('id', child_user_id)
    .eq('panel_id', panel_id)
    .single();
  if (!childUser) return NextResponse.json({ error: 'Child user not found' }, { status: 404 });

  const totalCharge = service.child_price * quantity;
  const totalCost = service.cost * quantity;
  const markup = totalCharge - totalCost;

  if (childUser.balance < totalCharge) {
    return NextResponse.json({ error: 'Insufficient child user balance' }, { status: 400 });
  }

  const idempotencyKey = req.headers.get('idempotency-key') ?? `order-${child_user_id}-${service_id}-${Date.now()}`;

  const { data: existing } = await supabase
    .from('child_orders')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (existing) {
    return NextResponse.json({ success: true, data: existing });
  }

  try {
    const { data: debitData, error: debitError } = await supabase
      .from('child_users')
      .update({ balance: childUser.balance - totalCharge })
      .eq('id', child_user_id)
      .eq('balance', childUser.balance)
      .select()
      .single();

    if (debitError || !debitData) {
      return NextResponse.json({ error: 'Concurrent modification, please retry' }, { status: 409 });
    }

    const { error: creditError } = await supabase.rpc('credit_wallet', {
      p_partner_id: panel_id,
      p_amount: markup,
      p_category: 'order',
      p_reference: idempotencyKey,
      p_metadata: { child_user_id, service_id, quantity },
    });

    if (creditError) {
      await supabase
        .from('child_users')
        .update({ balance: childUser.balance })
        .eq('id', child_user_id);
      return NextResponse.json({ error: creditError.message, hint: 'Balance reverted' }, { status: 500 });
    }

    let janjezOrderId: string | null = null;
    let orderStatus: 'pending' | 'processing' | 'failed' | 'failed_refunded' = 'pending';
    let refundProcessed = false;

    try {
      const janjezRes = await fetch(
        `${process.env.JANJEZ_MAIN_API_URL ?? ''}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.JANJEZ_MAIN_API_KEY ?? ''}`,
          },
          body: JSON.stringify({
            panel_id,
            service_id,
            child_user_id,
            quantity,
            link,
            charge: totalCharge,
            cost: totalCost,
            markup,
            idempotency_key: idempotencyKey,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (janjezRes.ok) {
        janjezOrderId = (await janjezRes.json()).id;
        orderStatus = 'processing';
      } else {
        orderStatus = 'failed';
      }
    } catch {
      orderStatus = 'failed';
    }

    if (orderStatus === 'failed') {
      const { error: refundError } = await supabase.rpc('debit_wallet', {
        p_partner_id: panel_id,
        p_amount: markup,
        p_category: 'order_refund',
        p_reference: `refund-${idempotencyKey}`,
      });

      if (!refundError) {
        await supabase.rpc('credit_wallet', {
          p_partner_id: child_user_id,
          p_amount: totalCharge,
          p_category: 'order_refund',
          p_reference: `refund-${idempotencyKey}`,
        });
        refundProcessed = true;
      }

      orderStatus = refundProcessed ? 'failed_refunded' : 'failed';
    }

    const { data: order, error: orderError } = await supabase
      .from('child_orders')
      .insert({
        panel_id, service_id, child_user_id, quantity, link,
        charge: totalCharge, cost: totalCost, markup,
        status: orderStatus,
        janjez_order_id: janjezOrderId,
        idempotency_key: idempotencyKey,
      }).select().single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

    if (orderStatus === 'failed_refunded') {
      return NextResponse.json({
        success: false,
        error: 'Order failed. Refund processed.',
        data: order,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}