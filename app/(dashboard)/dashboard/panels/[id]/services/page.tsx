'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ImportServicesButton from '@/components/services/ImportServicesButton';

interface Service {
  id: string;
  janjez_service_id: string;
  cost: number;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
  custom_name: string | null;
  custom_description: string | null;
  is_visible: boolean;
  display_order: number;
}

export default function PanelServicesPage() {
  const { id: panelId } = useParams<{ id: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const response = await fetch(`/api/partner/panels/${encodeURIComponent(panelId)}/services`, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load panel services');
    setServices(result.data ?? []);
  }, [panelId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/partner/panels/${encodeURIComponent(panelId)}/services`, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load panel services');
        if (active) setServices(result.data ?? []);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load panel services'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [panelId]);

  function changeService(id: string, patch: Partial<Service>) {
    setServices((current) => current.map((service) => service.id === id ? { ...service, ...patch } : service));
  }

  async function save(service: Service) {
    setSaving(service.id); setError(null); setNotice(null);
    try {
      const response = await fetch(`/api/partner/panels/${encodeURIComponent(panelId)}/services`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          child_price: Number(service.child_price),
          child_min_quantity: Number(service.child_min_quantity),
          child_max_quantity: Number(service.child_max_quantity),
          custom_name: service.custom_name,
          custom_description: service.custom_description,
          is_visible: service.is_visible,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save service');
      setNotice(`${service.custom_name || 'Service'} saved`);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save service'); }
    finally { setSaving(null); }
  }

  const visibleCount = services.filter((service) => service.is_visible).length;

  return <main className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold text-slate-950">Services & pricing</h1><p className="mt-1 text-sm text-slate-600">Import the Main catalogue, then set your child-facing price per 1,000 units and publication visibility.</p></div>
      <ImportServicesButton panelId={panelId} onImportComplete={async () => { try { await load(); setNotice('Service catalogue refreshed from Janjez Main.'); } catch (err) { setError(err instanceof Error ? err.message : 'Could not refresh services'); } }} />
    </header>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total services</p><p className="mt-1 text-2xl font-semibold text-slate-950">{services.length}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Published</p><p className="mt-1 text-2xl font-semibold text-slate-950">{visibleCount}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Default import markup</p><p className="mt-1 text-2xl font-semibold text-slate-950">50%</p></div>
    </div>

    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
    {loading ? <p className="text-slate-600">Loading services…</p> : services.length === 0 ? (
      <div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-950">No imported services</h2><p className="mt-1 text-sm text-slate-600">Use “Import Services from Janjez” to copy the read-only service catalogue into this panel.</p></div>
    ) : (
      <div className="space-y-4">
        {services.map((service) => {
          const cost = Number(service.cost);
          const price = Number(service.child_price);
          const markup = cost > 0 ? Math.round((price / cost - 1) * 100) : 0;
          return <article key={service.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-semibold text-slate-950">{service.custom_name || 'Unnamed service'}</h2><p className="mt-1 text-xs text-slate-500">Main service ID: {service.janjez_service_id}</p></div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={service.is_visible} onChange={(event) => changeService(service.id, { is_visible: event.target.checked })} className="h-4 w-4 rounded border-slate-300" /> Published</label>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-sm font-medium text-slate-700">Provider cost / 1,000 (KES)<input value={cost} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700" /></label>
              <label className="text-sm font-medium text-slate-700">Child price / 1,000 (KES)<input type="number" min={cost} step="0.01" value={service.child_price} onChange={(event) => changeService(service.id, { child_price: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950" /></label>
              <label className="text-sm font-medium text-slate-700">Minimum quantity<input type="number" min={1} step={1} value={service.child_min_quantity} onChange={(event) => changeService(service.id, { child_min_quantity: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950" /></label>
              <label className="text-sm font-medium text-slate-700">Maximum quantity<input type="number" min={1} step={1} value={service.child_max_quantity} onChange={(event) => changeService(service.id, { child_max_quantity: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950" /></label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Markup: <strong className="text-slate-950">{markup}%</strong> · Child price is charged proportionally to the ordered quantity.</p>
              <button type="button" disabled={saving === service.id} onClick={() => save(service)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{saving === service.id ? 'Saving…' : 'Save service'}</button>
            </div>
          </article>;
        })}
      </div>
    )}
  </main>;
}
