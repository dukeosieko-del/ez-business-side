import { NextRequest, NextResponse } from 'next/server';
import { signoutChildSession } from '@/lib/child-users/session';

export async function POST(req: NextRequest) {
  await signoutChildSession();
  return NextResponse.json({ success: true });
}