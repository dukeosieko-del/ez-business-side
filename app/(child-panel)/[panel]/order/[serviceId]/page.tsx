'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderForm() {
  const { panel, serviceId } = useParams<{ panel: string; serviceId: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/child/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ panel_id: panel, service_id: serviceId, quantity, link }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Order could not be placed');
      router.push(`/${panel}/orders/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-12">
      <Link href={`/${panel}/services`} className="text-sm text-blue-700 underline">Back to services</Link>
      <h1 className="mb-6 mt-3 text-3xl font-bold text-slate-950">Place order</h1>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-800">Quantity</label>
          <input id="quantity" type="number" min={1} max={1000} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950" />
        </div>
        <div>
          <label htmlFor="target-link" className="mb-1 block text-sm font-medium text-slate-800">Target URL</label>
          <input id="target-link" type="url" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://…" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950" />
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? 'Submitting…' : 'Submit order'}
        </button>
        <p className="text-xs text-slate-500">Demo orders are simulated and do not debit a wallet or submit to a provider.</p>
      </form>
    </main>
  );
}
