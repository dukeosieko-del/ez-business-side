import { NextRequest, NextResponse } from 'next/server';
import { destroyChildSession } from '@/lib/child-users/session';

export async function POST(req: NextRequest) {
  await destroyChildSession();
  return NextResponse.json({ success: true });
}