'use client';

import { useState, useEffect } from 'react';

export function AffiliateStats() {
  const [stats, setStats] = useState({ earned: 0, pending: 0, completed: 0 });

  useEffect(() => {
    fetch('/api/affiliate/stats')
      .then(res => res.json())
      .then(data => setStats(data.data ?? { earned: 0, pending: 0, completed: 0 }))
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Earned</h4>
        <p>KES {stats.earned.toLocaleString()}</p>
      </div>
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Pending</h4>
        <p>KES {stats.pending.toLocaleString()}</p>
      </div>
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Completed</h4>
        <p>KES {stats.completed.toLocaleString()}</p>
      </div>
    </div>
  );
}