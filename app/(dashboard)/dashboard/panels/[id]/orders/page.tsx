import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const panelId = searchParams.get('panel_id');
  const status = searchParams.get('status');
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();
  let query = supabase.from('orders').select('*', { count: 'exact' });

  if (panelId) query = query.eq('panel_id', panelId);
  if (status) query = query.eq('status', status);

  const { data: orders, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ success: true, data: { orders, total: count ?? 0, page, limit } });
}