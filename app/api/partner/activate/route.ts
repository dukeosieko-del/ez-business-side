import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';

/**
 * STK initiation is held until the verified callback and reconciliation
 * pipeline is enabled. No payment prompt is sent from this route for now.
 */
export async function POST(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    error: 'M-Pesa activation is temporarily paused while callback verification and ledger reconciliation are completed.',
    code: 'MPESA_ACTIVATION_NOT_READY',
  }, { status: 503 });
}
