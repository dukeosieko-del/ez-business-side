/**
 * Automated withdrawal approval is intentionally unavailable.
 * Do not debit a wallet until the M-Pesa B2C integration, callback
 * verification, idempotency, and reconciliation are implemented.
 */
export async function approveWithdrawal(_withdrawalId: string): Promise<never> {
  throw new Error('Automated withdrawal approval is disabled until payout verification is complete');
}
