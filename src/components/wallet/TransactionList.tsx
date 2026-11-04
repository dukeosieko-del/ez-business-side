'use client';

import { useEffect, useState } from 'react';
interface Transaction { id: string; amount: number; direction: 'credit' | 'debit'; category: string; created_at: string; }

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/partner/wallet/transactions?page=${page}&limit=${limit}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Could not load transactions');
        if (active) { setTransactions(payload.data?.transactions ?? []); setTotal(payload.data?.total ?? 0); setError(null); }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Could not load transactions'); }
    }
    void load();
    return () => { active = false; };
  }, [page]);
  return <section className="rounded-lg border border-gray-200 bg-white p-4">
    <h3 className="mb-3 font-semibold text-gray-900">Wallet transactions</h3>
    {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
    {!error && transactions.length === 0 && <p className="text-sm text-gray-500">No wallet transactions yet.</p>}
    {transactions.length > 0 && <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b text-left text-gray-500"><th className="px-3 py-2">Date</th><th className="px-3 py-2">Category</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2">Direction</th></tr></thead>
      <tbody>{transactions.map(tx => <tr key={tx.id} className="border-b border-gray-100"><td className="px-3 py-2">{new Date(tx.created_at).toLocaleString()}</td><td className="px-3 py-2">{tx.category}</td><td className="px-3 py-2 text-right">KES {Number(tx.amount).toLocaleString()}</td><td className="px-3 py-2 capitalize">{tx.direction}</td></tr>)}</tbody>
    </table></div>}
    <div className="mt-4 flex items-center justify-between text-sm"><span className="text-gray-500">{total} total transactions</span><div className="flex gap-2">
      <button className="rounded border px-3 py-1 disabled:opacity-40" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>Previous</button>
      <button className="rounded border px-3 py-1 disabled:opacity-40" onClick={() => setPage(p => p+1)} disabled={page*limit>=total}>Next</button>
    </div></div>
  </section>;
}
