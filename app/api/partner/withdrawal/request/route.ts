import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';
import { createWithdrawal } from '@/lib/withdrawal/create';

export async function POST(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { amount?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body.amount !== 'number' || !Number.isSafeInteger(body.amount) || body.amount < 500) {
    return NextResponse.json({ error: 'Minimum withdrawal is KES 500; enter a whole KES amount' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase.from('partners').select('phone').eq('id', partnerId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load partner payout details' }, { status: 500 });
  if (!partner?.phone) return NextResponse.json({ error: 'Add a verified M-Pesa number before requesting a withdrawal' }, { status: 400 });
  try {
    const withdrawal = await createWithdrawal({ partnerId, amount: body.amount, mpesaNumber: partner.phone });
    return NextResponse.json({ success: true, data: withdrawal }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not create withdrawal request' }, { status: 400 });
  }
}
