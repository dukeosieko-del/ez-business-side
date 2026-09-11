import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/onboarding/state';
import { hasPanels } from '@/lib/panels/provision';

export interface RedirectTarget {
  pathname: string;
  query?: Record<string, string>;
}

export async function getOnboardingRedirect(partnerId: string): Promise<RedirectTarget | null> {
  const supabase = getSupabaseAdmin();

  const { data: partner } = await supabase
    .from('partners')
    .select('onboarding_state')
    .eq('id', partnerId)
    .single();

  if (!partner) return null;

  if (!isOnboarded(partner.onboarding_state as Parameters<typeof isOnboarded>[0])) {
    return { pathname: '/dashboard' };
  }

  const panelsExist = await hasPanels(partnerId);
  if (!panelsExist) {
    return { pathname: '/dashboard/panels', query: { first: '1' } };
  }

  return null;
}
