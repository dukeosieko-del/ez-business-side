'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Order { id: string; service_id: string; quantity: number; link: string; charge: number; status: string; payment_method: string | null; created_at: string; }

export default function PanelOrdersPage() {
  const { panel } = useParams<{ panel: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/child/orders', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load orders');
        if (active) setOrders(result.data ?? []);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load orders'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link href={`/${panel}`} className="text-sm text-blue-700 underline">Back to panel</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold text-slate-950">Your orders</h1>
      {loading && <p className="text-slate-600">Loading orders…</p>}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>}
      {!loading && !error && orders.length === 0 && <p className="text-slate-600">You have not placed any orders yet.</p>}
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/${panel}/orders/${order.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
            <div className="flex flex-wrap justify-between gap-2"><strong className="text-slate-950">Order {order.id.slice(0, 8)}</strong><span className="text-sm text-slate-700">{order.status}</span></div>
            <p className="mt-1 text-sm text-slate-600">Quantity {order.quantity} · KES {Number(order.charge).toLocaleString('en-KE')}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
