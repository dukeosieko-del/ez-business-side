'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ApiKey { id: string; name: string; scopes: string[]; rate_limit: number; last_used_at: string | null; expires_at: string | null; revoked_at: string | null; created_at: string; }

export default function ChildApiKeysPage() {
  const { panel } = useParams<{ panel: string }>();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState('My integration');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/child/api-keys', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load API keys');
    setKeys(result.data ?? []);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load API keys')).finally(() => setLoading(false));
  }, []);

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true); setError(null); setSecret(null);
    try {
      const response = await fetch('/api/child/api-keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopes: ['services:read', 'orders:create'], rate_limit: 60 }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create API key');
      setSecret(result.data.token);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create API key'); }
    finally { setCreating(false); }
  }

  async function revoke(id: string) {
    if (!window.confirm('Revoke this API key? Existing integrations using it will stop working.')) return;
    try {
      const response = await fetch(`/api/child/api-keys/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not revoke key');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not revoke key'); }
  }

  return <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
    <Link href={`/${panel}`} className="text-sm text-blue-700 underline">Back to panel</Link>
    <h1 className="mb-2 mt-3 text-3xl font-bold text-slate-950">Developer API keys</h1>
    <p className="mb-6 text-sm text-slate-600">Keys are panel-scoped, permission-scoped, rate-limited, and shown only once.</p>
    <form onSubmit={createKey} className="mb-6 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <label className="min-w-56 flex-1 text-sm font-medium text-slate-800">Key name
        <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={64} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>
      <button disabled={creating} className="self-end rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{creating ? 'Creating…' : 'Generate API key'}</button>
    </form>
    {secret && <section className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
      <h2 className="font-semibold text-amber-950">Copy your new key now</h2>
      <p className="mt-1 text-sm text-amber-900">This secret will not be shown again. Store it in your server-side secret manager.</p>
      <code className="mt-3 block break-all rounded-lg bg-white p-3 text-sm text-slate-950">{secret}</code>
      <button type="button" onClick={() => navigator.clipboard.writeText(secret)} className="mt-3 rounded-lg border border-amber-500 px-3 py-2 text-sm font-medium text-amber-950">Copy key</button>
    </section>}
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p>Loading keys…</p> : <div className="space-y-3">{keys.map((key) => <article key={key.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div><h2 className="font-semibold text-slate-950">{key.name}</h2><p className="mt-1 text-xs text-slate-600">Scopes: {key.scopes.join(', ')} · {key.rate_limit}/min · Created {new Date(key.created_at).toLocaleDateString()}</p><p className="text-xs text-slate-600">{key.revoked_at ? 'Revoked' : key.expires_at ? `Expires ${new Date(key.expires_at).toLocaleDateString()}` : 'No expiry'}</p></div>
      {!key.revoked_at && <button type="button" onClick={() => revoke(key.id)} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50">Revoke</button>}
    </article>)}</div>}
    <p className="mt-8 text-sm text-slate-600">API reference: <a className="text-blue-700 underline" href="https://github.com/dukeosieko-del/ez-business-side/blob/feat/child-panel-platform-e2e-20261104/docs/15-CHILD-PANEL-API.md" target="_blank" rel="noreferrer">Child Panel API documentation</a></p>
  </main>;
}