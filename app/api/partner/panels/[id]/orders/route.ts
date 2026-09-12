import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();
  const { data: orders, count } = await supabase
    .from('child_orders')
    .select('*', { count: 'exact' })
    .eq('panel_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ success: true, data: { orders, total: count ?? 0, page, limit } });
}