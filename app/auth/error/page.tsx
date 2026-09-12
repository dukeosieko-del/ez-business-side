import Link from 'next/link';

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string; detail?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-8 py-12 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Sign-in failed</h1>
        <p className="text-gray-700 mb-2">
          Reason: <code className="text-sm">{searchParams.reason ?? 'unknown'}</code>
        </p>
        {searchParams.detail && (
          <p className="text-sm text-gray-500 mb-6">{searchParams.detail}</p>
        )}
        <Link
          href="/auth/sign-in"
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
