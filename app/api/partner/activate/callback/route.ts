import { NextResponse } from 'next/server';

/**
 * Fail closed until Safaricom callback authentication and transaction-status
 * reconciliation are fully configured. This endpoint intentionally performs
 * no wallet, partner-status, or payment-record mutation.
 */
export async function POST() {
  return NextResponse.json({
    error: 'M-Pesa callback settlement is temporarily disabled pending verified callback authentication and reconciliation.',
    code: 'MPESA_CALLBACK_NOT_READY',
  }, { status: 503 });
}
