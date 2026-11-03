import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  let body: { reason?: unknown } = {};
  try { body = await request.json(); } catch { /* optional reason */ }
  const reason = typeof body.reason === 'string' && body.reason.trim()
    ? body.reason.trim().slice(0, 500) : 'Rejected by administrator';
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('withdrawal_requests')
    .update({ status: 'rejected', rejected_reason: reason, updated_at: new Date().toISOString() })
    .eq('id', id).eq('status', 'pending').select('id').maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not update withdrawal request' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Request not found or no longer pending' }, { status: 409 });
  return NextResponse.json({ success: true });
}
