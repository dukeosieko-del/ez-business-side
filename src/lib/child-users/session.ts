import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SESSION_COOKIE = 'jez_child_session';

export interface ChildSession {
  id: string;
  panel_id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export async function createChildSession(payload: {
  panel_id: string;
  user_id: string;
  email: string;
}): Promise<ChildSession> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const session: ChildSession = {
    id,
    panel_id: payload.panel_id,
    user_id: payload.user_id,
    email: payload.email,
    created_at: createdAt,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return session;
}

export async function getChildSession(): Promise<ChildSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  const { data, error } = await supabase
    .from('child_users')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) return null;
  return data as ChildSession;
}

export async function signoutChildSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}