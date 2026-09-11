import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getBalance } from '@/lib/wallet/balance';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const balance = await getBalance(sessionCookie);
  return NextResponse.json({ success: true, data: { balance } });
}