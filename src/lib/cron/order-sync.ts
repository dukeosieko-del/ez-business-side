import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function syncOrders(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from('child_orders')
    .select('*')
    .eq('status', 'pending');

  for (const order of orders ?? []) {
    try {
      // Business Side owns order lifecycle; external submission via provider adapter.
      await supabase.from('child_orders').update({ status: 'processing' }).eq('id', order.id);
    } catch {
      // Log and continue
    }
  }
}