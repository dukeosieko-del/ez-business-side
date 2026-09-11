import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

interface SyncResult {
  synced: number;
  failed: number;
}

export async function syncPendingOrders(): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending');

  let synced = 0;
  let failed = 0;

  for (const order of orders ?? []) {
    try {
      const response = await fetch(`${process.env.JANJEZ_MAIN_API_URL ?? ''}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.JANJEZ_MAIN_API_KEY ?? ''}`,
        },
        body: JSON.stringify({
          panel_id: order.panel_id,
          service_id: order.service_id,
          child_user_id: order.child_user_id,
          quantity: order.quantity,
          link: order.link,
          idempotency_key: order.idempotency_key ?? randomUUID(),
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        await supabase.from('orders').update({ status: 'processing' }).eq('id', order.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}