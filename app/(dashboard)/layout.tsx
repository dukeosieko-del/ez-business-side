'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/reseller', label: 'Reseller' },
  { href: '/dashboard/affiliate', label: 'Affiliate' },
  { href: '/dashboard/wallet', label: 'Wallet' },
  { href: '/dashboard/withdrawals', label: 'Withdrawals' },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Janjez Business Side</h1>
          <Link href="/auth/sign-out" className="text-sm text-red-600 hover:underline">
            Sign out
          </Link>
        </div>
      </header>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </main>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`inline-block px-4 py-3 text-sm font-medium border-b-2 transition ${
        isActive
          ? 'border-green-600 text-green-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </Link>
  );
}
