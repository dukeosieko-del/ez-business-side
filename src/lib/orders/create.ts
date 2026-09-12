import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';
import { debitChildUser, refundChildUser } from '@/lib/wallet/child-balance';

const createOrderSchema = z.object({
  panel_id: z.string().uuid(),
  service_id: z.string().uuid(),
  child_user_id: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  link: z.string().url(),
});

export async function POST(req: NextRequest) {
  const reservationKey = req.headers.get('idempotency-key');
  if (!reservationKey) {
    return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
  }

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

  const { data: existing } = await supabase
    .from('child_orders')
    .select('*')
    .eq('idempotency_key', reservationKey)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, data: existing });
  }

  try {
    const { data: panel } = await supabase
      .from('child_panels')
      .select('partner_id')
      .eq('id', panel_id)
      .single();

    if (!panel) return NextResponse.json({ error: 'Panel not found' }, { status: 404 });

    const { data: reserved, error: reserveError } = await supabase
      .from('child_orders')
      .insert({
        panel_id, child_user_id, service_id, quantity, link,
        charge: totalCharge, cost: totalCost, markup,
        status: 'pending',
        idempotency_key: reservationKey,
      })
      .select()
      .single();

    if (reserveError?.code === '23505') {
      const { data: winner } = await supabase
        .from('child_orders')
        .select('*')
        .eq('idempotency_key', reservationKey)
        .single();
      return NextResponse.json({ success: true, data: winner });
    }

    if (reserveError || !reserved) {
      return NextResponse.json({ error: 'Failed to reserve order' }, { status: 500 });
    }

    try {
      await debitChildUser(child_user_id, totalCharge, childUser.balance);
    } catch (err) {
      await supabase.from('child_orders').update({ status: 'failed' }).eq('id', reserved.id);
      return NextResponse.json({ error: 'Insufficient balance or concurrent modification' }, { status: 409 });
    }

    const { error: creditError } = await supabase.rpc('credit_wallet', {
      p_partner_id: panel.partner_id,
      p_amount: markup,
      p_category: 'order',
      p_reference: reserved.id,
      p_metadata: { child_user_id, service_id, quantity },
    });

    if (creditError) {
      await refundChildUser(child_user_id, totalCharge);
      await supabase.from('child_orders').update({ status: 'failed' }).eq('id', reserved.id);
      return NextResponse.json({ error: creditError.message, hint: 'Balance reverted' }, { status: 500 });
    }

    let janjezOrderId: string | null = null;

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
            panel_id, service_id, child_user_id, quantity, link,
            charge: totalCharge, cost: totalCost, markup,
            idempotency_key: reservationKey,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (janjezRes.ok) {
        janjezOrderId = (await janjezRes.json()).id;
      }
    } catch {
      // Janjez unreachable — handled below
    }

    if (!janjezOrderId) {
      await refundChildUser(child_user_id, totalCharge);
      await supabase.rpc('debit_wallet', {
        p_partner_id: panel.partner_id,
        p_amount: markup,
        p_category: 'order_refund',
        p_reference: `refund-${reserved.id}`,
      });
      await supabase
        .from('child_orders')
        .update({ status: 'failed_refunded', janjez_order_id: null })
        .eq('id', reserved.id);
      return NextResponse.json({ error: 'Order failed. Refund processed.' }, { status: 502 });
    }

    await supabase
      .from('child_orders')
      .update({ status: 'processing', janjez_order_id: janjezOrderId })
      .eq('id', reserved.id);

    return NextResponse.json({ success: true, data: { ...reserved, janjez_order_id: janjezOrderId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}