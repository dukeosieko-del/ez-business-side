import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function checkDatabase(): Promise<{ ok: boolean; latency?: number }> {
  const start = Date.now();
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('partners').select('count').limit(1);
    return { ok: true, latency: Date.now() - start };
  } catch {
    return { ok: false };
  }
}