'use client';

import { useState } from 'react';

export function TopupForm() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/partner/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Top-up failed');
      } else {
        setSuccess(true);
        setAmount('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Top Up Wallet</h3>
      {success && <p style={{ color: 'green' }}>Top-up initiated successfully!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Amount (KES, min 50):</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={50}
            required
            style={{ display: 'block', marginTop: '4px', padding: '8px', width: '200px' }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Top Up'}
        </button>
      </form>
    </div>
  );
}