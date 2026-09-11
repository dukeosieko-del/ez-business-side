import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  await supabase.from('withdrawals').update({
    status: 'rejected',
    rejection_reason: body.reason ?? 'No reason provided',
    rejected_at: new Date().toISOString(),
  }).eq('id', id);

  return NextResponse.json({ success: true });
}