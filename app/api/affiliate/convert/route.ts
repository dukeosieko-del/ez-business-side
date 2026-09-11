import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { findClickByFingerprint, calculateCommission, isWithinHoldPeriod } from '@/lib/affiliate/commission';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, customer_ip, customer_user_agent } = body;

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const fingerprint = `${customer_ip ?? 'unknown'}:${customer_user_agent ?? 'unknown'}`;
  const click = await findClickByFingerprint(fingerprint);

  if (!click) {
    return NextResponse.json({ success: false, reason: 'No matching click' });
  }

  const inHold = await isWithinHoldPeriod(click.clicked_at);
  if (inHold) {
    return NextResponse.json({ success: false, reason: 'Still in hold period' });
  }

  const commission = calculateCommission(order.markup ?? order.charge);

  await supabase.from('affiliate_commissions').insert({
    affiliate_id: click.affiliate_id,
    order_id,
    amount: commission,
    status: 'pending',
    hold_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return NextResponse.json({ success: true, commission });
}