import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedPartner(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'Wallet top-ups are temporarily unavailable while verified payment callbacks are being completed.' },
    { status: 503 },
  );
}
