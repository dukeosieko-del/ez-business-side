import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPanelContext } from '@/lib/tenant/context';

export default async function ChildPanelHome({ params }: { params: Promise<{ panel: string }> }) {
  const { panel: subdomain } = await params;
  const context = await getPanelContext({ subdomain });
  if (!context) notFound();

  return (
    <main className="min-h-screen" style={{ backgroundColor: context.branding.backgroundColor, color: context.branding.textColor }}>
      <div className="mx-auto max-w-5xl px-6 py-16">
        {context.status === 'demo' && <p className="mb-6 inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">Demo mode — sample orders only; no payments or provider fulfilment</p>}
        {context.branding.logo && <img src={context.branding.logo} alt="" className="mb-8 h-12 w-auto object-contain" />}
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">{context.copy.heroTitle}</h1>
        <p className="mb-8 max-w-2xl text-lg opacity-80">{context.copy.heroSubtitle}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${context.subdomain}/services`} className="rounded-lg px-6 py-3 font-semibold text-white" style={{ backgroundColor: context.branding.primaryColor }}>{context.copy.ctaText}</Link>
          <Link href={`/${context.subdomain}/orders`} className="rounded-lg border px-6 py-3 font-semibold">Track orders</Link>
          <Link href={`/${context.subdomain}/signin`} className="rounded-lg border px-6 py-3 font-semibold">Sign in</Link>
          <Link href={`/${context.subdomain}/signup`} className="rounded-lg border px-6 py-3 font-semibold">Create account</Link>
          <Link href={`/${context.subdomain}/api-keys`} className="rounded-lg border px-6 py-3 font-semibold">Developer API</Link>
        </div>
        <p className="mt-16 text-sm opacity-60">{context.copy.footerText}</p>
      </div>
    </main>
  );
}
