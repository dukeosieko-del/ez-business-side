import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { DomainConfig } from '@/components/editor/DomainConfig';

export default async function DomainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/auth/sign-in');

  const supabase = getSupabaseAdmin();
  const { data: panel } = await supabase.from('child_panels')
    .select('id, subdomain, custom_domain, custom_domain_verified')
    .eq('id', id).eq('partner_id', session.partner_id).maybeSingle();
  if (!panel) notFound();

  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <Link href={`/dashboard/panels/${id}`} className="text-sm text-slate-600 hover:text-slate-950">← Back to panel</Link>
    <h1 className="mb-2 mt-4 text-3xl font-bold text-slate-950">Custom Domain</h1>
    <p className="mb-8 text-slate-700">Link and verify your own domain for this panel.</p>
    <DomainConfig panelId={id} subdomain={panel.subdomain} customDomain={panel.custom_domain} verified={panel.custom_domain_verified} />
  </div>;
}
