import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', sessionCookie);

  const earned = commissions
    ?.filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0) ?? 0;
  const pending = commissions
    ?.filter(c => c.status === 'pending' || c.status === 'hold')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0) ?? 0;
  const completed = commissions
    ?.filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0) ?? 0;

  return NextResponse.json({
    success: true,
    data: { earned, pending, completed },
  });
}