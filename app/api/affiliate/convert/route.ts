import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'Affiliate commissions are recorded internally only after a verified paid-order callback. Client-submitted conversions are not accepted.',
  }, { status: 410 });
}
