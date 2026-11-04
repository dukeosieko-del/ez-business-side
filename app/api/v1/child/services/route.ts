import { NextRequest, NextResponse } from 'next/server';
import { authenticateChildApiKey } from '@/lib/api-keys/child';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await authenticateChildApiKey(request, 'services:read');
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('child_services')
    .select('id, custom_name, custom_description, category, child_price, child_min_quantity, child_max_quantity')
    .eq('panel_id', auth.principal.panelId)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'Could not load services' }, { status: 500 });
  return NextResponse.json({
    success: true,
    mode: auth.principal.mode,
    data: (data ?? []).map((service) => ({
      id: service.id,
      name: service.custom_name || 'Service',
      description: service.custom_description || '',
      category: service.category || 'Other',
      price: Number(service.child_price),
      min_quantity: service.child_min_quantity ?? 1,
      max_quantity: service.child_max_quantity ?? 100000,
    })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
