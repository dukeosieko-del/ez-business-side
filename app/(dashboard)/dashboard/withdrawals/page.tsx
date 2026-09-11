import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { WithdrawalRequest } from '@/components/wallet/WithdrawalRequest';

export default async function WithdrawalsDashboard() {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  const supabase = getSupabaseAdmin();
  const { data: withdrawals } = await supabase.from('withdrawals').select('*');

  return (
    <main style={{ padding: '24px' }}>
      <h1>Withdrawals</h1>
      <WithdrawalRequest />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Partner</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Status</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals?.map(w => (
            <tr key={w.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{w.partner_id}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>{w.amount}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'center' }}>{w.status}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'center' }}>
                {w.status === 'pending_admin_approval' && 'Approve / Reject'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}