import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { WithdrawalRequest } from '@/components/wallet/WithdrawalRequest';

export default async function WithdrawalsDashboard() {
  const session = await getSession();
  if (!session) redirect('/auth/sign-in');
  const supabase = getSupabaseAdmin();
  const { data: withdrawals, error } = await supabase.from('withdrawal_requests')
    .select('id, amount, fee, net_amount, mpesa_number, status, created_at')
    .eq('partner_id', session.partner_id).order('created_at', { ascending: false }).limit(50);
  return (
    <main className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1><p className="mt-1 text-sm text-gray-600">Request a withdrawal and track its review status.</p></div>
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Request a withdrawal</h2>
        <WithdrawalRequest />
        <p className="mt-3 text-xs text-gray-500">Requests are reviewed by an administrator. A request does not trigger an M-Pesa payout.</p>
      </section>
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Your requests</h2>
        {error ? <p className="text-sm text-red-700">Withdrawal history is temporarily unavailable.</p> : !withdrawals?.length ? <p className="text-sm text-gray-500">You have no withdrawal requests yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="px-3 py-2">Date</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-right">Fee</th><th className="px-3 py-2 text-right">Net</th><th className="px-3 py-2">M-Pesa number</th><th className="px-3 py-2">Status</th></tr></thead>
            <tbody>{withdrawals.map((item) => <tr key={item.id} className="border-b border-gray-100">
              <td className="px-3 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
              <td className="px-3 py-3 text-right">KES {Number(item.amount).toLocaleString()}</td>
              <td className="px-3 py-3 text-right">KES {Number(item.fee).toLocaleString()}</td>
              <td className="px-3 py-3 text-right">KES {Number(item.net_amount).toLocaleString()}</td>
              <td className="px-3 py-3">{item.mpesa_number}</td><td className="px-3 py-3 capitalize">{String(item.status).replaceAll('_', ' ')}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
