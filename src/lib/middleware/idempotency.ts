import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function checkIdempotency(
  request: NextRequest,
  endpoint: string
): Promise<{ cached: boolean; response?: unknown }> {
  const key = request.headers.get('Idempotency-Key');
  if (!key) return { cached: false };

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('idempotency_keys')
    .select('response_status, response_body')
    .eq('key', key)
    .eq('endpoint', endpoint)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (data) {
    return { cached: true, response: data.response_body };
  }

  return { cached: false };
}

export async function storeIdempotency(
  key: string,
  endpoint: string,
  status: number,
  body: unknown
) {
  const supabase = getSupabaseAdmin();
  const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000);
  await supabase.from('idempotency_keys').insert({
    key,
    endpoint,
    response_status: status,
    response_body: body,
    expires_at: expiresAt.toISOString(),
  });
}
