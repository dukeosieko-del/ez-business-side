'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Order { id: string; status: string; charge: number; quantity: number; link: string; created_at: string; payment_method: string | null; }

export default function OrderDetailPage() {
  const { panel, id } = useParams<{ panel: string; id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/child/orders/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load order');
        if (active) setOrder(result.data);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load order'); });
    return () => { active = false; };
  }, [id]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href={`/${panel}/orders`} className="text-sm text-blue-700 underline">Back to orders</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold text-slate-950">Order details</h1>
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>}
      {!order && !error && <p className="text-slate-600">Loading order…</p>}
      {order && <dl className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div><dt className="text-sm text-slate-500">Reference</dt><dd className="font-medium text-slate-950">{order.id}</dd></div>
        <div><dt className="text-sm text-slate-500">Status</dt><dd className="font-medium text-slate-950">{order.status}</dd></div>
        <div><dt className="text-sm text-slate-500">Quantity</dt><dd className="font-medium text-slate-950">{order.quantity}</dd></div>
        <div><dt className="text-sm text-slate-500">Charge</dt><dd className="font-medium text-slate-950">KES {Number(order.charge).toLocaleString('en-KE')}</dd></div>
        <div className="sm:col-span-2"><dt className="text-sm text-slate-500">Target URL</dt><dd className="break-all font-medium text-slate-950">{order.link}</dd></div>
        <div><dt className="text-sm text-slate-500">Payment mode</dt><dd className="font-medium text-slate-950">{order.payment_method || 'Not set'}</dd></div>
        <div><dt className="text-sm text-slate-500">Created</dt><dd className="font-medium text-slate-950">{new Date(order.created_at).toLocaleString()}</dd></div>
      </dl>}
    </main>
  );
}
