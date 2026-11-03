import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page') ?? 1);
  const requestedLimit = Number(searchParams.get('limit') ?? 20);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }
  const limit = Math.min(requestedLimit, 100);
  const offset = (page - 1) * limit;
  const supabase = getSupabaseAdmin();
  const { data: transactions, count, error } = await supabase.from('wallet_transactions')
    .select('id, amount, direction, category, reference, balance_before, balance_after, metadata, created_at', { count: 'exact' })
    .eq('partner_id', partnerId).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: 'Could not load wallet transactions' }, { status: 500 });
  return NextResponse.json({ success: true, data: { transactions: transactions ?? [], total: count ?? 0, page, limit } });
}
