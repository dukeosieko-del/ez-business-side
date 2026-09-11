'use client';

import { useState } from 'react';

export function OrderFilters({ onFilter }: { onFilter: (filters: { status?: string; from?: string; to?: string }) => void }) {
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function handleApply() {
    onFilter({ status: status || undefined, from: from || undefined, to: to || undefined });
  }

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={e => setTo(e.target.value)} />
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}