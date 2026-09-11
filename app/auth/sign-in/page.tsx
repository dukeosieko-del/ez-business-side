'use client';

import { getJanjezSsoUrl } from '@/lib/auth/sso';

export default function SignInPage() {
  const ssoUrl = getJanjezSsoUrl('/dashboard');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-green-900">
      <div className="max-w-md w-full px-8 py-12 bg-white rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in to Janjez Business Side</h1>
        <p className="text-gray-600 mb-8">
          Use your Janjez account to continue. No separate password required.
        </p>
        <a
          href={ssoUrl}
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-lg font-semibold transition"
        >
          Continue with Janjez
        </a>
        <p className="mt-6 text-sm text-gray-500 text-center">
          Don&apos;t have a Janjez account?{' '}
          <a href="https://janjez.social/auth/sign-up" className="text-green-600 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
