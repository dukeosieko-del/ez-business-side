'use client';

import { useState } from 'react';

export function PayoutRequest() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/affiliate/payout/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || 'Payout failed');
      else setAmount('');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Amount (min KES 500):</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={500} required />
      <button type="submit" disabled={loading}>{loading ? '...' : 'Request Payout'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}