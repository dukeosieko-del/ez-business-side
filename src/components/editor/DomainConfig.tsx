'use client';

import { useState } from 'react';

export function DomainConfig({
  panelId,
  subdomain,
  customDomain,
  verified,
}: {
  panelId: string;
  subdomain: string;
  customDomain: string | null;
  verified: boolean;
}) {
  const [domain, setDomain] = useState(customDomain ?? '');
  const [isVerified, setIsVerified] = useState(verified);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAddDomain() {
    setError(null);
    setMessage(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`/api/partner/panels/${panelId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'Failed');
      setMessage('Domain added. Configure DNS records as shown below.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleVerify() {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`/api/partner/panels/${panelId}/domain/verify`, {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'Verification failed');
      if (json.data.verified) {
        setIsVerified(true);
        setMessage('Domain verified successfully.');
      } else {
        setMessage('DNS not yet propagated. Try again in a few minutes.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Your Panel URLs
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Subdomain:</span>{' '}
            <span className="font-mono">
              {subdomain}.partners.janjez.social
            </span>
          </div>
          {customDomain && (
            <div>
              <span className="text-gray-500">Custom domain:</span>{' '}
              <span className="font-mono">{customDomain}</span>{' '}
              {isVerified ? (
                <span className="text-green-600">✓ verified</span>
              ) : (
                <span className="text-yellow-600">pending verification</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Add Custom Domain
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono"
          />
          <button
            onClick={handleAddDomain}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Add
          </button>
        </div>

        {customDomain && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">DNS Configuration</h4>
            <p className="text-xs text-gray-600 mb-3">
              Add this record to your domain&apos;s DNS settings:
            </p>
            <div className="font-mono text-sm bg-white p-3 rounded border">
              <div>CNAME &nbsp;&nbsp; {domain} &nbsp;→&nbsp; partners.janjez.social</div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              After adding the DNS record, wait 5-30 minutes for propagation, then click Verify.
            </p>
            <button
              onClick={handleVerify}
              disabled={checking || isVerified}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
            >
              {checking ? 'Checking...' : isVerified ? 'Verified' : 'Verify Domain'}
            </button>
          </div>
        )}

        {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
        {message && <div className="text-sm text-blue-600 mt-4">{message}</div>}
      </div>
    </div>
  );
}
