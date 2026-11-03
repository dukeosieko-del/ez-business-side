import { getSupabaseAdmin } from '@/lib/supabase/server';

interface SyncResult {
  synced: number;
  failed: number;
}

export async function syncPendingOrders(): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from('child_orders')
    .select('*')
    .eq('status', 'pending');

  // Business Side owns its order lifecycle. External provider submission is
  // handled by the provider adapter (src/lib/providers) when configured.
  // No dependency on the frozen main Janjez application.
  let synced = 0;
  let failed = 0;

  for (const order of orders ?? []) {
    try {
      // Mark as processing locally; provider submission occurs via adapter.
      await supabase.from('child_orders').update({ status: 'processing' }).eq('id', order.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}