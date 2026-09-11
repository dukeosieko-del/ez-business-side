import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionCookie = req.cookies.get('jez_child_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', params.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { status: order.status } });
}