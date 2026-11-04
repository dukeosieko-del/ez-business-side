'use client';

import { ActivationButton } from './ActivationButton';

interface ActivationModalProps {
  partnerId: string;
}

export function ActivationModal({ partnerId }: ActivationModalProps) {
  return (
    <section role="region" aria-labelledby="activation-title" className="rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm">
      <h2 id="activation-title" className="text-xl font-semibold text-slate-950">Complete activation</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Account activation requires a KES 1,499 M-Pesa payment. Payment initiation is currently paused while callback verification and ledger reconciliation are completed.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>Confirm that your account phone number is a valid M-Pesa number.</li>
        <li>When the payment service is enabled, request a payment prompt.</li>
        <li>Confirm the amount on your handset and wait for server-side verification.</li>
        <li>Your account will update only after a verified settlement callback.</li>
      </ol>
      <div className="mt-5"><ActivationButton partnerId={partnerId} /></div>
    </section>
  );
}
