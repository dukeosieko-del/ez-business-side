'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  amount: number;
  direction: 'credit' | 'debit';
  category: string;
  created_at: string;
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/partner/wallet/transactions?page=${page}`)
      .then(res => res.json())
      .then(data => setTransactions(data.data?.transactions ?? []))
      .catch(() => {});
  }, [page]);

  return (
    <div style={{ padding: '16px' }}>
      <h3>Transactions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Category</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Direction</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{tx.created_at}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{tx.category}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>
                {tx.direction === 'credit' ? '+' : '-'}{tx.amount}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>{tx.direction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '16px' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}