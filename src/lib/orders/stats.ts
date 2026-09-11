import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function pollOrderStatus(orderId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/child/orders/${orderId}/status`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.status ?? null;
  } catch {
    return null;
  }
}