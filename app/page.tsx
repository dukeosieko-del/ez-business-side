import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-green-900 text-white">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold mb-6">Janjez Business Side</h1>
        <p className="text-xl mb-8">
          Launch your own white-label SMM panel. Powered by Janjez.
        </p>
        <Link
          href="/auth/sign-in"
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
