import { NextRequest, NextResponse } from 'next/server';
import { approveWithdrawal } from '@/lib/withdrawal/approve';
import { isAdmin } from '@/lib/admin/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await approveWithdrawal(id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}