import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

const updateSchema = z.object({
  service_id: z.string().uuid(),
  child_price: z.number().finite().nonnegative().max(10000000).optional(),
  child_min_quantity: z.number().int().positive().max(10000000).optional(),
  child_max_quantity: z.number().int().positive().max(10000000).optional(),
  custom_name: z.string().trim().max(100).nullable().optional(),
  custom_description: z.string().trim().max(300).nullable().optional(),
  is_visible: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels').select('id').eq('id', id).eq('partner_id', partnerId).maybeSingle();
  if (!panel) return NextResponse.json({ error: 'Panel not found' }, { status: 404 });

  const { data, error } = await supabase.from('child_services')
    .select('id, janjez_service_id, cost, child_price, child_min_quantity, child_max_quantity, custom_name, custom_description, is_visible, display_order')
    .eq('panel_id', id).order('display_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load services' }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: panelId } = await params;
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const values = parsed.data;
  if (values.child_min_quantity && values.child_max_quantity && values.child_min_quantity > values.child_max_quantity) {
    return NextResponse.json({ error: 'Minimum quantity cannot exceed maximum quantity' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels').select('id').eq('id', panelId).eq('partner_id', partnerId).maybeSingle();
  if (!panel) return NextResponse.json({ error: 'Panel not found' }, { status: 404 });

  const { data: current } = await supabase.from('child_services').select('id, cost')
    .eq('id', values.service_id).eq('panel_id', panelId).maybeSingle();
  if (!current) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  if (values.child_price !== undefined) {
    const cost = Number(current.cost ?? 0);
    if (values.child_price < cost) return NextResponse.json({ error: 'Child price cannot be below provider cost' }, { status: 400 });
    if (cost > 0 && values.child_price > cost * 2) return NextResponse.json({ error: 'Markup cannot exceed 100% of provider cost' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const field of ['child_price','child_min_quantity','child_max_quantity','custom_name','custom_description','is_visible'] as const) {
    if (values[field] !== undefined) patch[field] = values[field];
  }
  const { data, error } = await supabase.from('child_services').update(patch)
    .eq('id', values.service_id).eq('panel_id', panelId)
    .select('id, child_price, child_min_quantity, child_max_quantity, custom_name, custom_description, is_visible').single();
  if (error || !data) return NextResponse.json({ error: 'Could not update service' }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
