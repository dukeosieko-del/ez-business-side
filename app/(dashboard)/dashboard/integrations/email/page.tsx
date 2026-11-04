'use client';

import { useEffect, useState } from 'react';

interface Health {
  apiKeyConfigured: boolean;
  apiAuthVerified: boolean;
  senderEmailConfigured: boolean;
  senderRegistered: boolean;
  senderActive: boolean;
  smtpCredentialsConfigured: boolean;
  smtpAuthVerified: boolean;
  transactionalReady: boolean;
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
    <span className="text-sm text-slate-700">{label}</span>
    <span className={ok ? 'rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800' : 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900'}>{ok ? 'Verified' : 'Needs setup'}</span>
  </div>;
}

export default function EmailIntegrationPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const response = await fetch('/api/admin/integrations/brevo/health', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not verify Brevo configuration');
      setHealth(result);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not verify Brevo configuration'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  return <main className="mx-auto max-w-4xl space-y-6 p-6 text-slate-950">
    <header><h1 className="text-2xl font-semibold">Brevo email integration</h1><p className="mt-1 text-sm text-slate-600">Transactional and account communication use the Brevo API. SMTP relay credentials are tracked separately.</p></header>
    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Connection checks</h2><button type="button" onClick={refresh} disabled={loading} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60">{loading ? 'Checking…' : 'Re-check'}</button></div>
      {loading && <p className="text-sm text-slate-600">Checking Brevo configuration…</p>}
      {health && <>
        <Status ok={health.apiKeyConfigured && health.apiAuthVerified} label="Brevo API authentication" />
        <Status ok={health.senderEmailConfigured && health.senderRegistered && health.senderActive} label="Configured sender registered and active" />
        <Status ok={health.smtpCredentialsConfigured} label="SMTP login and SMTP key present in server environment" />
        <Status ok={health.smtpAuthVerified} label="SMTP relay authentication test" />
        <div className="mt-4 rounded-lg bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Transactional readiness</p><p className="mt-1 text-sm text-slate-700">{health.transactionalReady ? 'Brevo API and sender checks passed.' : 'Not production-ready. Complete the missing checks above before enabling real email delivery.'}</p></div>
      </>}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Required Vercel environment variables</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li><code>BREVO_API_KEY</code> — server-only Brevo API key for transactional email.</li>
        <li><code>BREVO_SENDER_EMAIL</code> — an authenticated, active sender address in Brevo.</li>
        <li><code>BREVO_SMTP_LOGIN</code> and <code>BREVO_SMTP_KEY</code> — SMTP relay credentials, if SMTP transport is enabled separately.</li>
      </ul>
      <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">Do not paste credentials into this page or the browser. Set them as encrypted Vercel environment variables. An API key is not an SMTP password; use a dedicated Brevo SMTP key.</p>
      <p className="mt-3 text-xs text-slate-500">This page does not send a test email or disclose credential values. SMTP authentication is not yet probed by the current app.</p>
    </section>
  </main>;
}
