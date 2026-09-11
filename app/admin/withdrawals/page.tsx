import { isAdmin } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';

export default async function WithdrawalsPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  return (
    <div>
      <h1>Withdrawal Queue</h1>
      <p>Admin approval queue for withdrawals</p>
    </div>
  );
}