import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionCookie = req.cookies.get('jez_bs_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase.from('orders').select('*').eq('id', params.id).single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}