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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/child/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel_id: panelId, name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
      } else {
        router.push('/services');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <button type="submit" disabled={loading}>{loading ? '...' : 'Sign Up'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}