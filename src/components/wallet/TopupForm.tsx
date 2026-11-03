'use client';

export function TopupForm() {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
    <h3 className="font-semibold text-gray-900">Wallet top-ups</h3>
    <p className="mt-2 text-sm text-amber-900">Top-ups are temporarily unavailable while verified payment callbacks are being completed.</p>
  </div>;
}
