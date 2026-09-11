'use client';

import { useState } from 'react';

interface ActivationButtonProps {
  partnerId: string;
}

export function ActivationButton({ partnerId }: ActivationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleActivate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/partner/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Activation failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleActivate} disabled={loading}>
        {loading ? 'Activating...' : 'Activate with M-Pesa (KES 1,499)'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
