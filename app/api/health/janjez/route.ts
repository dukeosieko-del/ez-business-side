import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json({ janjez: 'disabled', reason: 'external dependency removed' }, { status: 503 });
}
