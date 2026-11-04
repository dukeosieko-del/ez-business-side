'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { OrderFilters } from '@/components/dashboard/OrderFilters';

export default function PanelOrdersPage() {
  const params = useParams<{ id: string }>();
  const panelId = params.id;
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`/api/partner/panels/${encodeURIComponent(panelId)}/orders?page=1&limit=100`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load panel orders');
        if (active) setOrders(result.data?.orders ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load panel orders');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [panelId]);

  return <main className="space-y-5 p-6">
    <h1 className="text-2xl font-semibold text-slate-950">Panel orders</h1>
    <OrderFilters onFilter={() => {}} />
    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {loading ? <p className="text-slate-600">Loading orders…</p> : <OrdersTable orders={orders} />}
  </main>;
}
