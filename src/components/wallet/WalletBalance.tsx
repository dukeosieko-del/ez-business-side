'use client';

import { useState, useEffect } from 'react';

export function WalletBalance() {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetch('/api/partner/wallet/balance')
      .then(res => res.json())
      .then(data => setBalance(data.data?.balance ?? 0))
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Balance</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>KES {balance.toLocaleString()}</p>
    </div>
  );
}