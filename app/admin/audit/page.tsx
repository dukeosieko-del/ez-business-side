import { isAdmin } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';

export default async function AuditPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  return (
    <div>
      <h1>Audit Log</h1>
      <p>Audit log viewer</p>
    </div>
  );
}