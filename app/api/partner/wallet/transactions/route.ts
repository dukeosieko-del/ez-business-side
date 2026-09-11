import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();
  const { data: transactions, count } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('partner_id', sessionCookie)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ success: true, data: { transactions, total: count ?? 0, page, limit } });
}