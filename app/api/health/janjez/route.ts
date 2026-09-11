import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.JANJEZ_MAIN_API_URL ?? ''}/health`, {
      signal: AbortSignal.timeout(10000),
    });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ janjez: 'unreachable' }, { status: 503 });
  }
}