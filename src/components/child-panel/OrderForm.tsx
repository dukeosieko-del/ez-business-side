'use client';

import { useState } from 'react';

interface OrderFormProps {
  serviceId: string;
  panelId: string;
}

export function OrderForm({ serviceId, panelId }: OrderFormProps) {
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
        body: JSON.stringify({ panel_id: panelId, service_id: serviceId, quantity, link }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || 'Order failed');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} required />
      <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." required />
      <button type="submit" disabled={loading}>{loading ? '...' : 'Order'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}