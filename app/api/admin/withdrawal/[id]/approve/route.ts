import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await params;
  return NextResponse.json(
    { error: 'Automated approval is disabled until the payout integration and ledger reconciliation are verified.' },
    { status: 503 },
  );
}
