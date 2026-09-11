import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyHmacSignature } from '@/lib/hmac/verify';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-janjez-signature');

  if (!signature || !await verifyHmacSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { order_id, status } = body;

  const supabase = getSupabaseAdmin();
  await supabase.from('orders').update({ status }).eq('id', order_id);

  if (status === 'completed' || status === 'failed') {
    await supabase.from('orders').update({ completed_at: new Date().toISOString() }).eq('id', order_id);
  }

  return NextResponse.json({ success: true });
}