import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomBytes, createHash } from 'crypto';

const SESSION_COOKIE = 'jez_bs_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  partner_id: string;
  janjez_user_id: string;
  created_at: string;
}

export async function createSession(payload: SessionPayload) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const supabase = getSupabaseAdmin();

  await supabase.from('sessions').insert({
    partner_id: payload.partner_id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  await supabase.from('audit_log').insert({
    actor_type: 'partner',
    actor_id: payload.partner_id,
    action: 'session_created',
    resource_type: 'session',
    metadata: { janjez_user_id: payload.janjez_user_id },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id, created_at')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!session) return null;

  return {
    partner_id: session.partner_id,
    janjez_user_id: '',
    created_at: session.created_at,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const supabase = getSupabaseAdmin();
    await supabase.from('sessions').delete().eq('token_hash', tokenHash);
  }

  cookieStore.delete(SESSION_COOKIE);
}