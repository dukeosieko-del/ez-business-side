import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function syncOrders(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from('child_orders')
    .select('*')
    .eq('status', 'pending');

  for (const order of orders ?? []) {
    try {
      await fetch(`${process.env.JANJEZ_MAIN_API_URL ?? ''}/orders/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.JANJEZ_MAIN_API_KEY ?? ''}`,
        },
        body: JSON.stringify({ order_id: order.id }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      // Log and continue
    }
  }
}