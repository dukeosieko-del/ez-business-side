'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getOnboardingRedirect } from '@/lib/auth/redirect';
import { hasPanels } from '@/lib/panels/provision';

export default function DashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const supabase = getSupabaseAdmin();
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.push('/auth/sign-in');
          return;
        }

        const partnerId = session.session.user.user_metadata?.partner_id;
        if (!partnerId) {
          router.push('/auth/sign-in');
          return;
        }

        const redirect = await getOnboardingRedirect(partnerId);
        if (redirect) {
          const params = new URLSearchParams(redirect.query);
          router.push(`${redirect.pathname}${params.size ? `?${params.toString()}` : ''}`);
          return;
        }

        const panelsExist = await hasPanels(partnerId);
        if (!panelsExist) {
          router.push('/dashboard/panels?first=1');
          return;
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
      <p className="text-gray-600">Welcome to your partner dashboard.</p>
    </div>
  );
}
