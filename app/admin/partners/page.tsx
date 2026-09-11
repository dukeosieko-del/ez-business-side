import { isAdmin } from '@/lib/admin/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PartnersPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  const supabase = getSupabaseAdmin();
  const { data: partners } = await supabase.from('partners').select('*');

  return (
    <div>
      <h1>Partners</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Balance</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Admin</th>
          </tr>
        </thead>
        <tbody>
          {partners?.map(p => (
            <tr key={p.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{p.email}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{p.status}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>{p.wallet_balance ?? 0}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'center' }}>{p.is_admin ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}