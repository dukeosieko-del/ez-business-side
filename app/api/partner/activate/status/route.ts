import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

export async function GET(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    error: 'M-Pesa status polling is paused until authenticated callback settlement and ledger reconciliation are enabled.',
    code: 'MPESA_STATUS_NOT_READY',
  }, { status: 503 });
}
