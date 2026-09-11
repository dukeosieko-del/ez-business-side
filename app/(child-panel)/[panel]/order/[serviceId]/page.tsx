'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export function OrderForm({ serviceId }: { serviceId: string }) {
  const { panel } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/child/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel_id: panel, service_id: serviceId, quantity, link }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || 'Order failed');
      else router.push(`/orders/${data.data.id}`);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Place Order</h2>
      <div>
        <label>Quantity:</label>
        <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} required />
      </div>
      <div>
        <label>Link:</label>
        <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." required />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Place Order'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}