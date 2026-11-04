import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';
import { initiateStkPush } from '@/lib/mpesa/client';
import { mpesaConfig } from '@/lib/mpesa/config';
import { env } from '@/lib/config/env';

export async function POST(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!mpesaConfig.consumerKey || !mpesaConfig.consumerSecret || !mpesaConfig.shortcode || !mpesaConfig.passkey) {
    return NextResponse.json({ error: 'M-Pesa STK credentials are incomplete' }, { status: 503 });
  }
  if (!mpesaConfig.callbackToken) {
    return NextResponse.json({ error: 'M-Pesa callback verification is not configured' }, { status: 503 });
  }
  if (env.MPESA_ENV === 'production' && !mpesaConfig.livePaymentsEnabled) {
    return NextResponse.json({ error: 'Live M-Pesa payments are disabled pending final go-live approval' }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const { data: partner, error: partnerError } = await supabase
    .from('partners').select('id, phone, status').eq('id', partnerId).maybeSingle();
  if (partnerError) return NextResponse.json({ error: 'Could not load partner profile' }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  if (partner.status !== 'pending') return NextResponse.json({ error: 'Account is already activated or not eligible' }, { status: 409 });

  const phone = String(partner.phone ?? '').replace(/\D/g, '');
  if (!/^254[17]\d{8}$/.test(phone)) {
    return NextResponse.json({ error: 'Add a valid Kenyan M-Pesa number to your partner profile first' }, { status: 400 });
  }

  const amount = Number(env.PARTNER_ACTIVATION_FEE ?? 1499);
  if (!Number.isSafeInteger(amount) || amount < 1) return NextResponse.json({ error: 'Activation amount configuration is invalid' }, { status: 503 });

  const idempotencyKey = randomUUID();
  const { data: payment, error: insertError } = await supabase.from('activation_payments').insert({
    partner_id: partner.id, amount, phone, status: 'pending', idempotency_key: idempotencyKey,
    metadata: { environment: env.MPESA_ENV, initiated_by: 'partner_session' },
  }).select('id').single();
  if (insertError || !payment) return NextResponse.json({ error: 'Could not create payment intent' }, { status: 500 });

  const result = await initiateStkPush(phone, amount, idempotencyKey);
  if (!result.success || !result.data?.CheckoutRequestID) {
    await supabase.from('activation_payments').update({ status: 'failed', metadata: { failure: result.error ?? 'No checkout ID' } }).eq('id', payment.id);
    return NextResponse.json({ error: result.error ?? 'M-Pesa did not return a checkout reference' }, { status: 502 });
  }

  const { error: updateError } = await supabase.from('activation_payments')
    .update({ mpesa_checkout_id: result.data.CheckoutRequestID })
    .eq('id', payment.id).eq('status', 'pending');
  if (updateError) return NextResponse.json({ error: 'Payment was initiated but its checkout reference could not be saved; contact support before retrying' }, { status: 500 });

  return NextResponse.json({
    success: true,
    mode: env.MPESA_ENV,
    status: 'pending',
    data: { checkoutRequestID: result.data.CheckoutRequestID, amount, phone },
  }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
}
