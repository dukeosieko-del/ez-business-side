import { NextRequest, NextResponse } from 'next/server';
import { validateActivationReadiness } from '@/lib/onboarding/validate';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await validateActivationReadiness(sessionCookie);
  return NextResponse.json(result);
}
