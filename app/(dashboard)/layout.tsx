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
          <a href="/auth/sign-out" className="text-sm text-red-600 hover:underline">
            Sign out
          </a>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </main>
  );
}
