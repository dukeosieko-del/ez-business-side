import { NextRequest, NextResponse } from 'next/server';
import { initiateTopup } from '@/lib/wallet/topup';

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await request.json();

  try {
    const result = await initiateTopup(sessionCookie, amount);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}