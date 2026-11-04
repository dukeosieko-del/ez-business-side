import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomBytes, createHash } from 'crypto';

const SESSION_COOKIE = 'jez_child_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface ChildSessionPayload {
  panel_id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export async function createChildSession(payload: ChildSessionPayload) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('child_users').update({
    session_token_hash: tokenHash,
    session_expires_at: expiresAt.toISOString(),
  }).eq('id', payload.user_id).eq('panel_id', payload.panel_id).select('id').maybeSingle();

  if (error || !data) throw new Error('Could not persist child session');

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
  return { expiresAt };
}

export async function getChildSession(): Promise<ChildSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase.from('child_users')
    .select('id, panel_id, email, session_expires_at, status')
    .eq('session_token_hash', tokenHash)
    .gt('session_expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !user || user.status !== 'active') return null;
  return {
    panel_id: user.panel_id,
    user_id: user.id,
    email: user.email,
    created_at: new Date().toISOString(),
  };
}

export async function destroyChildSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const supabase = getSupabaseAdmin();
    await supabase.from('child_users').update({
      session_token_hash: null,
      session_expires_at: null,
    }).eq('session_token_hash', tokenHash);
  }
  cookieStore.delete(SESSION_COOKIE);
}
