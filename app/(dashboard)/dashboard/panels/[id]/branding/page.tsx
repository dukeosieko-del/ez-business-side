import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { BrandingEditor } from '@/components/editor/BrandingEditor';
import { DEFAULT_BRANDING, PanelBranding } from '@/lib/tenant/context';

export default async function BrandingPage({
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
    .select('id, subdomain, branding')
    .eq('id', id)
    .eq('partner_id', session)
    .maybeSingle();

  if (!panel) notFound();

  const branding: PanelBranding = {
    ...DEFAULT_BRANDING,
    ...(typeof panel.branding === 'object' && panel.branding !== null ? panel.branding : {}),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/dashboard/panels/${id}`}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to panel
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Branding</h1>
      <p className="text-gray-600 mb-8">
        Customize colors, logo, and fonts for {panel.subdomain}.partners.janjez.social
      </p>

      <BrandingEditor panelId={id} initialBranding={branding} />
    </div>
  );
}
