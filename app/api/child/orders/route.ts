import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const orderSchema = z.object({
  panel_id: z.string().uuid(),
  service_id: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  link: z.string().url(),
});

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('jez_child_session')?.value;
  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase.from('child_users').select('id, panel_id, balance').eq('id', sessionCookie).single();
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { panel_id, service_id, quantity, link } = parsed.data;

  const { data: service } = await supabase
    .from('child_services')
    .select('id, name, child_price, cost')
    .eq('id', service_id)
    .eq('panel_id', panel_id)
    .single();
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const totalCharge = service.child_price * quantity;
  const totalCost = service.cost * quantity;
  const markup = totalCharge - totalCost;

  if (session.balance < totalCharge) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  const { data: order, error } = await supabase.from('child_orders').insert({
    panel_id, service_id, child_user_id: session.id, quantity, link,
    charge: totalCharge, cost: totalCost, markup, status: 'pending',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: order });
}