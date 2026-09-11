import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('jez_bs_session')?.value;
  if (!session) return false;

  const supabase = getSupabaseAdmin();
  const { data: partner } = await supabase
    .from('partners')
    .select('is_admin')
    .eq('id', session)
    .single();

  return partner?.is_admin === true;
}