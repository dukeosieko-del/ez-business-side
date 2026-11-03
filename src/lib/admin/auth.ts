import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase
    .from('partners')
    .select('is_admin')
    .eq('id', session.partner_id)
    .maybeSingle();

  return !error && partner?.is_admin === true;
}
