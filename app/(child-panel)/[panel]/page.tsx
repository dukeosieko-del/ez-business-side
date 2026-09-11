import { notFound } from 'next/navigation';
import { getPanelContext } from '@/lib/tenant/context';

export default async function ChildPanelHome({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel: subdomain } = await params;
  const context = await getPanelContext({ subdomain });

  if (!context) notFound();

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-4">{context.copy.heroTitle}</h1>
        <p className="text-xl opacity-80 mb-8">{context.copy.heroSubtitle}</p>
        <button
          className="px-8 py-4 rounded-lg font-semibold text-white"
          style={{ backgroundColor: context.branding.primaryColor }}
        >
          {context.copy.ctaText}
        </button>
        <p className="mt-16 text-sm opacity-60">{context.copy.footerText}</p>
      </div>
    </main>
  );
}
