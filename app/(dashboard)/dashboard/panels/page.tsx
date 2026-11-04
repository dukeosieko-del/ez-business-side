'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublishButton } from '@/components/dashboard/PublishButton';

interface Panel {
  id: string;
  subdomain: string;
  custom_domain: string | null;
  status: string;
  created_at: string;
}

export default function PanelsPage() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/partner/panels', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not load panels');
      setPanels(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load panels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createDemo() {
    setCreatingDemo(true);
    setError(null);
    try {
      const response = await fetch('/api/partner/panels/demo', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not create demo panel');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create demo panel');
    } finally {
      setCreatingDemo(false);
    }
  }

  if (loading) return <p className="text-slate-600">Loading panels…</p>;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Child panels</h1>
          <p className="mt-1 text-sm text-slate-600">Provision, configure, and preview each client-facing panel.</p>
        </div>
        <button
          type="button"
          onClick={createDemo}
          disabled={creatingDemo}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creatingDemo ? 'Preparing demo…' : 'Create / open demo panel'}
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {panels.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">No child panels yet</h2>
          <p className="mt-1 text-sm text-slate-600">Create a demo first, then configure branding, services, payment methods, and a custom domain.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {panels.map((panel) => (
            <article key={panel.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">{panel.subdomain}</h2>
                  <p className="mt-1 text-sm text-slate-600">Status: {panel.status}</p>
                  <p className="text-sm text-slate-600">Client URL: <Link className="text-blue-700 underline" href={`/${panel.subdomain}`}>/{panel.subdomain}</Link></p>
                  {panel.custom_domain && <p className="text-sm text-slate-600">Custom domain: {panel.custom_domain}</p>}
                </div>
                <Link href={`/dashboard/panels/${panel.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">Open configuration</Link>
              </div>
              <nav aria-label={`Configuration for ${panel.subdomain}`} className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href={`/dashboard/panels/${panel.id}/services`} className="text-blue-700 underline">Services & pricing</Link>
                <Link href={`/dashboard/panels/${panel.id}/branding`} className="text-blue-700 underline">Branding</Link>
                <Link href={`/dashboard/panels/${panel.id}/copy`} className="text-blue-700 underline">Content</Link>
                <Link href={`/dashboard/panels/${panel.id}/domain`} className="text-blue-700 underline">Custom domain</Link>
                <Link href={`/dashboard/panels/${panel.id}/orders`} className="text-blue-700 underline">Orders</Link>
                <PublishButton panelId={panel.id} />
              </nav>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
