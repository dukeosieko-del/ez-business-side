import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const createOrderSchema = z.object({
  panel_id: z.string().uuid(),
  service_id: z.string().uuid(),
  child_user_id: z.string().uuid(),
  quantity: z.number().min(1),
  link: z.string().url(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { panel_id, service_id, child_user_id, quantity, link } = parsed.data;

  const supabase = getSupabaseAdmin();

  const { data: service } = await supabase
    .from('services')
    .select('id, name, price, cost')
    .eq('id', service_id)
    .eq('panel_id', panel_id)
    .single();

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const { data: childUser } = await supabase
    .from('child_users')
    .select('id, panel_id')
    .eq('id', child_user_id)
    .eq('panel_id', panel_id)
    .single();

  if (!childUser) {
    return NextResponse.json({ error: 'Child user not found' }, { status: 404 });
  }

  const totalCharge = service.price * quantity;
  const totalCost = service.cost * quantity;
  const markup = totalCharge - totalCost;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      panel_id,
      service_id,
      child_user_id,
      quantity,
      link,
      charge: totalCharge,
      cost: totalCost,
      markup,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: order });
}