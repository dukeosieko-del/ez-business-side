import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { PartnerStatus } from '@/types/partner';
import { validateActivationReadiness } from '@/lib/onboarding/validate';
import { ActivationButton } from '@/components/onboarding/ActivationButton';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('jez_bs_session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  const supabase = getSupabaseAdmin();
  const { data: partner } = await supabase
    .from('partners')
    .select('id, status')
    .eq('id', sessionCookie)
    .single();

  if (partner?.status === PartnerStatus.Active) {
    redirect('/dashboard');
  }

  const result = await validateActivationReadiness(sessionCookie);

  if (result.valid) {
    redirect('/dashboard');
  }

  return (
    <main>
      <h1>Activate Your Account</h1>
      <ActivationButton partnerId={sessionCookie} />
    </main>
  );
}
