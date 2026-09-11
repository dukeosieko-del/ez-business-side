import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { initiateStkPush } from '@/lib/mpesa/client';
import { env } from '@/lib/config/env';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: partner } = await supabase
    .from('partners')
    .select('id, phone, status')
    .eq('id', sessionCookie)
    .single();

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  if (partner.status !== 'pending') {
    return NextResponse.json({ error: 'Already activated' }, { status: 400 });
  }

  const idempotencyKey = randomUUID();

  try {
    const stkPush = await initiateStkPush(
      partner.phone || '254700000000',
      Number(env.PARTNER_ACTIVATION_FEE ?? 1499),
      idempotencyKey
    );

    await supabase.from('activation_payments').insert({
      partner_id: partner.id,
      mpesa_checkout_id: stkPush.CheckoutRequestID ?? idempotencyKey,
      amount: Number(env.PARTNER_ACTIVATION_FEE ?? 1499),
      phone: partner.phone || '',
      status: 'pending',
      idempotency_key: idempotencyKey,
    });

    return NextResponse.json({ success: true, data: { checkoutRequestID: stkPush.CheckoutRequestID } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
