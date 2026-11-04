import { isAdmin } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export default async function WithdrawalsPage() {
  if (!(await isAdmin())) redirect('/');
  const supabase = getSupabaseAdmin();
  const { data: requests, error } = await supabase.from('withdrawal_requests')
    .select('id, partner_id, amount, fee, net_amount, mpesa_number, status, created_at')
    .order('created_at', { ascending: false }).limit(100);
  return (
    <main className="space-y-6">
      <div><h1 className="text-2xl font-bold">Withdrawal Queue</h1><p className="mt-1 text-sm text-gray-600">Administrative review queue. Automated approval and M-Pesa payouts remain disabled until the payout integration is verified.</p></div>
      {error ? <p className="text-sm text-red-700">The withdrawal queue could not be loaded.</p> : !requests?.length ? <p className="text-sm text-gray-500">There are no withdrawal requests.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500"><th className="px-3 py-3">Request</th><th className="px-3 py-3">Partner ID</th><th className="px-3 py-3 text-right">Amount</th><th className="px-3 py-3 text-right">Fee</th><th className="px-3 py-3 text-right">Net</th><th className="px-3 py-3">M-Pesa number</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Created</th></tr></thead>
          <tbody>{requests.map((item) => <tr key={item.id} className="border-b border-gray-100">
            <td className="px-3 py-3 font-mono text-xs">{item.id}</td><td className="px-3 py-3 font-mono text-xs">{item.partner_id}</td>
            <td className="px-3 py-3 text-right">KES {Number(item.amount).toLocaleString()}</td><td className="px-3 py-3 text-right">KES {Number(item.fee).toLocaleString()}</td><td className="px-3 py-3 text-right">KES {Number(item.net_amount).toLocaleString()}</td>
            <td className="px-3 py-3">{item.mpesa_number}</td><td className="px-3 py-3 capitalize">{String(item.status).replaceAll('_', ' ')}</td><td className="px-3 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
          </tr>)}</tbody>
        </table></div>
      )}
    </main>
  );
}
