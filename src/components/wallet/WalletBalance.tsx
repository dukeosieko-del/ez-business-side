'use client';

import { useEffect, useState } from 'react';

export function WalletBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/partner/wallet/balance');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Could not load wallet balance');
        if (active) setBalance(Number(payload.data?.balance ?? 0));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load wallet balance');
      }
    }
    void load();
    return () => { active = false; };
  }, []);
  return <div className="min-w-56 rounded-lg border border-gray-200 bg-white p-4">
    <h3 className="text-sm font-medium text-gray-500">Wallet balance</h3>
    {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : <p className="mt-2 text-2xl font-bold text-gray-900">{balance === null ? 'Loading…' : `KES ${balance.toLocaleString()}`}</p>}
  </div>;
}
