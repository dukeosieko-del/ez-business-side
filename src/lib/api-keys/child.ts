import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface ChildApiPrincipal {
  panelId: string;
  childUserId: string;
  keyId: string;
  scopes: string[];
  mode: 'demo' | 'live';
}

export type ChildApiAuthResult =
  | { ok: true; principal: ChildApiPrincipal }
  | { ok: false; status: 401 | 403 | 429; error: string };

function equalHash(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function authenticateChildApiKey(
  request: NextRequest,
  requiredScope: string,
): Promise<ChildApiAuthResult> {
  const authorization = request.headers.get('authorization') ?? '';
  const match = /^Bearer jzb_(live|demo)_([a-f0-9]{16})\.([A-Za-z0-9_-]{32,})$/.exec(authorization);
  if (!match) return { ok: false, status: 401, error: 'A valid Business Side API key is required' };

  const [, tokenMode, keyId, secret] = match;
  const supabase = getSupabaseAdmin();
  const { data: key, error } = await supabase
    .from('child_api_keys')
    .select('key_id, key_hash, panel_id, child_user_id, scopes, rate_limit, expires_at, revoked_at')
    .eq('key_id', keyId)
    .maybeSingle();

  if (error || !key || key.revoked_at || (key.expires_at && new Date(key.expires_at).getTime() <= Date.now())) {
    return { ok: false, status: 401, error: 'API key is invalid, expired, or revoked' };
  }

  const suppliedHash = createHash('sha256').update(secret).digest('hex');
  if (!equalHash(suppliedHash, key.key_hash)) return { ok: false, status: 401, error: 'API key is invalid' };

  const { data: panel } = await supabase
    .from('child_panels')
    .select('status')
    .eq('id', key.panel_id)
    .in('status', ['active', 'demo'])
    .maybeSingle();
  if (!panel || panel.status !== tokenMode) return { ok: false, status: 403, error: 'API key is not valid for this panel mode' };

  const scopes = (key.scopes ?? []) as string[];
  if (!scopes.includes(requiredScope) && !scopes.includes('*')) {
    return { ok: false, status: 403, error: `Missing required scope: ${requiredScope}` };
  }

  const { data: withinLimit, error: limitError } = await supabase.rpc('consume_child_api_key_rate_limit', {
    p_key_id: key.key_id,
    p_limit: key.rate_limit,
  });
  if (limitError) return { ok: false, status: 503, error: 'API rate limiter is unavailable' } as ChildApiAuthResult;
  if (!withinLimit) return { ok: false, status: 429, error: 'API key rate limit exceeded' };

  await supabase.from('child_api_keys').update({ last_used_at: new Date().toISOString() }).eq('key_id', key.key_id);
  return {
    ok: true,
    principal: {
      panelId: key.panel_id,
      childUserId: key.child_user_id,
      keyId: key.key_id,
      scopes,
      mode: panel.status as 'demo' | 'live',
    },
  };
}
