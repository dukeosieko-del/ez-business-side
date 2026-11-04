'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/reseller', label: 'Reseller' },
  { href: '/dashboard/panels', label: 'Child Panels' },
  { href: '/dashboard/affiliate', label: 'Affiliate' },
  { href: '/dashboard/wallet', label: 'Wallet' },
  { href: '/dashboard/withdrawals', label: 'Withdrawals' },
  { href: '/dashboard/integrations/email', label: 'Email' },
];

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-950">Janjez Business Side</h1>
          <Link href="/auth/sign-out" className="text-sm font-medium text-red-700 hover:underline">Sign out</Link>
        </div>
      </header>
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <div className="flex min-w-max items-center space-x-1">
            {navItems.map((item) => <NavLink key={item.href} href={item.href} label={item.label} />)}
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </main>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return <Link href={href} className={`inline-block border-b-2 px-4 py-3 text-sm font-medium transition ${isActive
    ? 'border-blue-700 text-blue-800'
    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'}`}>{label}</Link>;
}
