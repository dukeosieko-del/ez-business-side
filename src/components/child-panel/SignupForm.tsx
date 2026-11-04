'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignupForm({ panelId }: { panelId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/child/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel_id: panelId, name, email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sign up failed');
      router.push(`/${panelId}/services`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div><label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-800">Name</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} maxLength={100} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950" /></div>
      <div><label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-800">Email</label><input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950" /></div>
      <div><label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-800">Password (12+ characters)</label><input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={12} maxLength={128} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950" /></div>
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button>
    </form>
  );
}
