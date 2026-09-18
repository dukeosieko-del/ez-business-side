import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_type: 'user' | 'admin' | 'system' | 'webhook';
  action: string;
  target_type: string;
  target_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export async function writeAuditLog(input: {
  actor_id?: string | null;
  actor_type: AuditLog['actor_type'];
  action: string;
  target_type: string;
  target_id?: string | null;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
}): Promise<AuditLog> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: input.actor_id ?? null,
      actor_type: input.actor_type,
      action: input.action,
      target_type: input.target_type,
      target_id: input.target_id ?? null,
      before_state: input.before_state ?? null,
      after_state: input.after_state ?? null,
      metadata: input.metadata ?? {},
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to write audit log');
  return data as AuditLog;
}

export async function listAuditLogs(input: {
  target_type?: string;
  target_id?: string;
  actor_id?: string;
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('audit_logs').select().order('created_at', { ascending: false });

  if (input.target_type) query = query.eq('target_type', input.target_type);
  if (input.target_id) query = query.eq('target_id', input.target_id);
  if (input.actor_id) query = query.eq('actor_id', input.actor_id);
  if (input.action) query = query.eq('action', input.action);

  query = query.limit(input.limit ?? 50);
  if (input.offset) query = query.range(input.offset, input.offset + (input.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AuditLog[];
}