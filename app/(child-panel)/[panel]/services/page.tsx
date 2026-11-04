'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
}

export default function ServiceCatalogue() {
  const params = useParams<{ panel: string }>();
  const panel = params.panel;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/child/panels/${encodeURIComponent(panel)}/services`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Could not load services');
        if (active) setServices(result.data ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load services');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [panel]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link href={`/${panel}`} className="text-sm text-blue-700 underline">Back to panel</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold text-slate-950">Services</h1>
      {loading && <p className="text-slate-600">Loading available services…</p>}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>}
      {!loading && !error && services.length === 0 && <p className="text-slate-600">No services are published yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">{service.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            <p className="mt-4 font-semibold text-slate-950">KES {Number(service.child_price).toLocaleString('en-KE')} / 1,000 units</p>
            <p className="mt-1 text-xs text-slate-500">Quantity: {service.child_min_quantity}–{service.child_max_quantity}</p>
            <Link href={`/${panel}/order/${service.id}`} className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Order service</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
