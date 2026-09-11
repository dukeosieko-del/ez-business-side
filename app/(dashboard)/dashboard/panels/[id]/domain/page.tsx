import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { DomainConfig } from '@/components/editor/DomainConfig';

export default async function DomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const session = cookieStore.get('jez_bs_session')?.value;
  if (!session) redirect('/auth/sign-in');

  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase
    .from('child_panels')
    .select('id, subdomain, custom_domain, custom_domain_verified')
    .eq('id', id)
    .eq('partner_id', session)
    .maybeSingle();

  if (!panel) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/dashboard/panels/${id}`}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to panel
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Custom Domain</h1>
      <p className="text-gray-600 mb-8">
        Link your own domain to your panel.
      </p>

      <DomainConfig
        panelId={id}
        subdomain={panel.subdomain}
        customDomain={panel.custom_domain}
        verified={panel.custom_domain_verified}
      />
    </div>
  );
}
