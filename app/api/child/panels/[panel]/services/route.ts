import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ panel: string }> },
) {
  const { panel: subdomain } = await params;
  const supabase = getSupabaseAdmin();

  const { data: panel, error: panelError } = await supabase
    .from('child_panels')
    .select('id, status')
    .eq('subdomain', subdomain)
    .in('status', ['active', 'demo'])
    .maybeSingle();

  if (panelError || !panel) {
    return NextResponse.json({ error: 'Panel not found or unavailable' }, { status: 404 });
  }

  const { data: services, error } = await supabase
    .from('child_services')
    .select('id, child_price, child_min_quantity, child_max_quantity, custom_name, custom_description, category, is_visible')
    .eq('panel_id', panel.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Could not load published services' }, { status: 500 });
  }

  const safeServices = (services ?? []).map((service) => ({
    id: service.id,
    name: service.custom_name || 'Service',
    description: service.custom_description || '',
    category: service.category || 'Other',
    child_price: Number(service.child_price),
    child_min_quantity: service.child_min_quantity,
    child_max_quantity: service.child_max_quantity,
  }));

  return NextResponse.json({
    success: true,
    data: safeServices,
    mode: panel.status === 'demo' ? 'demo' : 'live',
  });
}
