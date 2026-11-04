import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { BrandingEditor } from '@/components/editor/BrandingEditor';
import { DEFAULT_BRANDING, PanelBranding } from '@/lib/tenant/context';

export default async function BrandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/auth/sign-in');

  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels')
    .select('id, subdomain, branding').eq('id', id).eq('partner_id', session.partner_id).maybeSingle();
  if (!panel) notFound();

  const branding: PanelBranding = {
    ...DEFAULT_BRANDING,
    ...(typeof panel.branding === 'object' && panel.branding !== null ? panel.branding : {}),
  };

  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Link href={`/dashboard/panels/${id}`} className="text-sm text-slate-600 hover:text-slate-950">← Back to panel</Link>
    <h1 className="mb-2 mt-4 text-3xl font-bold text-slate-950">Branding</h1>
    <p className="mb-8 text-slate-700">Customize colors, logo, and fonts for {panel.subdomain}.</p>
    <BrandingEditor panelId={id} initialBranding={branding} />
  </div>;
}
