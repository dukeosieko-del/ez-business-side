import { NextRequest, NextResponse } from 'next/server';
import { createPayout } from '@/lib/affiliate/payout';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await req.json();

  try {
    const payout = await createPayout(sessionCookie, amount);
    return NextResponse.json({ success: true, data: payout });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}