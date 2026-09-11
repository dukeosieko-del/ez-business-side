import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PartnerStatus } from '@/types/partner';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { CheckoutRequestID, ResultCode, ResultDesc } = body;

  if (ResultCode !== 0) {
    const supabase = getSupabaseAdmin();
    await supabase.from('activation_payments').update({ status: 'failed' }).eq('mpesa_checkout_id', CheckoutRequestID);
    return NextResponse.json({ error: `M-Pesa payment failed: ${ResultDesc}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: paymentRecord, error: fetchError } = await supabase
    .from('activation_payments')
    .select('*')
    .eq('mpesa_checkout_id', CheckoutRequestID)
    .single();

  if (fetchError || !paymentRecord) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  if (paymentRecord.status !== 'pending') {
    return NextResponse.json({ error: 'Payment already processed' }, { status: 409 });
  }

  const { error: partnerError } = await supabase
    .from('partners')
    .select('id')
    .eq('id', paymentRecord.partner_id)
    .single();

  if (partnerError) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  await supabase.rpc('credit_wallet', {
    p_partner_id: paymentRecord.partner_id,
    p_amount: paymentRecord.amount,
    p_category: 'activation',
    p_reference: CheckoutRequestID,
  });

  await supabase
    .from('partners')
    .update({
      status: PartnerStatus.Active,
      activation_paid_at: new Date().toISOString(),
      activation_amount: paymentRecord.amount,
    })
    .eq('id', paymentRecord.partner_id);

  await supabase.from('activation_payments').update({
    status: 'paid',
    completed_at: new Date().toISOString(),
  }).eq('id', paymentRecord.id);

  await supabase.from('audit_log').insert({
    actor_type: 'partner',
    actor_id: paymentRecord.partner_id,
    action: 'activation_payment_completed',
    resource_type: 'activation',
    metadata: { checkoutRequestID: CheckoutRequestID, amount: paymentRecord.amount },
  });

  return NextResponse.json({ success: true });
}