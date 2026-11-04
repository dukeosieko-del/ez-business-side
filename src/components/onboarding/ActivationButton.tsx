'use client';

import { useState } from 'react';

interface ActivationButtonProps { partnerId: string; }

export function ActivationButton({ partnerId }: ActivationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleActivate() {
    setLoading(true); setError(null); setNotice(null);
    try {
      const response = await fetch('/api/partner/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'M-Pesa activation is unavailable');
      setNotice('Payment prompt initiated. Complete the prompt and wait for confirmation.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={handleActivate} disabled={loading} className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'Checking payment service…' : 'Check M-Pesa activation'}
      </button>
      {notice && <p role="status" className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    </div>
  );
}
