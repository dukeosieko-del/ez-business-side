import { NextRequest, NextResponse } from 'next/server';
import { queryStkStatus } from '@/lib/mpesa/client';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const checkoutRequestID = url.searchParams.get('checkoutRequestID');

  if (!checkoutRequestID) {
    return NextResponse.json({ error: 'checkoutRequestID required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: paymentRecord, error: fetchError } = await supabase
    .from('activation_payments')
    .select('*')
    .eq('mpesa_checkout_id', checkoutRequestID)
    .single();

  if (fetchError || !paymentRecord) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  if (paymentRecord.status === 'paid' || paymentRecord.status === 'failed') {
    return NextResponse.json({ success: true, data: { status: paymentRecord.status } });
  }

  try {
    const result = await queryStkStatus(checkoutRequestID);
    const isPaid = result.success && result.data?.ResultCode === 0;

    await supabase.from('activation_payments').update({
      status: isPaid ? 'paid' : 'failed',
      completed_at: isPaid ? new Date().toISOString() : paymentRecord.completed_at,
    }).eq('mpesa_checkout_id', checkoutRequestID);

    return NextResponse.json({ success: true, data: { status: isPaid ? 'paid' : 'pending' } });
  } catch {
    return NextResponse.json({ success: true, data: { status: 'pending' } });
  }
}