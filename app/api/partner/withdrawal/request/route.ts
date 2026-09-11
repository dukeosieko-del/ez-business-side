import { NextRequest, NextResponse } from 'next/server';
import { createWithdrawal } from '@/lib/withdrawal/create';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = (await import('@/lib/supabase/server')).getSupabaseAdmin();
  const { data: partner } = await supabase.from('partners').select('phone').eq('id', sessionCookie).single();

  const { amount } = await req.json();

  try {
    const withdrawal = await createWithdrawal({
      partnerId: sessionCookie,
      amount,
      phone: partner?.phone ?? '',
    });
    return NextResponse.json({ success: true, data: withdrawal });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}