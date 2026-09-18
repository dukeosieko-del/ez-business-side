import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface CatalogueSyncRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  services_found: number;
  services_added: number;
  services_updated: number;
  services_removed: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function createSyncRun(input: {
  source: string;
  metadata?: Record<string, unknown>;
}): Promise<CatalogueSyncRun> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('catalogue_sync_runs')
    .insert({
      source: input.source,
      status: 'pending',
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to create sync run');
  return data as CatalogueSyncRun;
}

export async function updateSyncRun(
  id: string,
  patch: Partial<Omit<CatalogueSyncRun, 'id' | 'started_at' | 'created_at'>>
): Promise<CatalogueSyncRun> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('catalogue_sync_runs')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to update sync run');
  return data as CatalogueSyncRun;
}

export async function completeSyncRun(
  id: string,
  stats: {
    services_found?: number;
    services_added?: number;
    services_updated?: number;
    services_removed?: number;
    error_message?: string | null;
  }
): Promise<CatalogueSyncRun> {
  return updateSyncRun(id, {
    status: stats.error_message ? 'failed' : 'completed',
    completed_at: new Date().toISOString(),
    services_found: stats.services_found ?? 0,
    services_added: stats.services_added ?? 0,
    services_updated: stats.services_updated ?? 0,
    services_removed: stats.services_removed ?? 0,
    error_message: stats.error_message ?? null,
  });
}

export async function listSyncRuns(limit = 50): Promise<CatalogueSyncRun[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('catalogue_sync_runs')
    .select()
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as CatalogueSyncRun[];
}

export async function getLatestSyncRun(): Promise<CatalogueSyncRun | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('catalogue_sync_runs')
    .select()
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CatalogueSyncRun) ?? null;
}