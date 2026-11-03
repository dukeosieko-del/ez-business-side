import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('partners').select('wallet_balance').eq('id', partnerId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load wallet balance' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: { balance: Number(data.wallet_balance ?? 0) } });
}
