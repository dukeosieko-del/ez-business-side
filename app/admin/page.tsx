import { isAdmin } from '@/lib/admin/auth';
import { getAdminStats } from '@/lib/admin/stats';

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) return null;

  const stats = await getAdminStats();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div style={{ padding: '16px', border: '1px solid #ddd' }}>
          <h3>Partners</h3>
          <p>{stats.partners}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #ddd' }}>
          <h3>Orders</h3>
          <p>{stats.orders}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #ddd' }}>
          <h3>Withdrawals</h3>
          <p>{stats.withdrawals}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #ddd' }}>
          <h3>Transactions</h3>
          <p>{stats.transactions}</p>
        </div>
      </div>
    </div>
  );
}