import { NextRequest, NextResponse } from 'next/server';
import { checkDatabase } from '@/lib/monitoring/health';

export async function GET(req: NextRequest) {
  const db = await checkDatabase();
  return NextResponse.json({ db });
}