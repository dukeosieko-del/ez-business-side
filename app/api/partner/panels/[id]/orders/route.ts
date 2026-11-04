import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? 1));
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 20)));
  const offset = (page - 1) * limit;
  const supabase = getSupabaseAdmin();

  const { data: panel } = await supabase.from('child_panels')
    .select('id').eq('id', id).eq('partner_id', partnerId).maybeSingle();
  if (!panel) return NextResponse.json({ error: 'Panel not found' }, { status: 404 });

  const { data: orders, count, error } = await supabase.from('child_orders')
    .select('id, service_id, child_user_id, quantity, link, charge, cost, markup, status, payment_method, created_at, completed_at', { count: 'exact' })
    .eq('panel_id', id).order('created_at', { ascending: false})
    .range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: 'Could not load panel orders' }, { status: 500 });
  return NextResponse.json({ success: true, data: { orders: orders ?? [], total: count ?? 0, page, limit } }, { headers: { 'Cache-Control': 'no-store' } });
}
