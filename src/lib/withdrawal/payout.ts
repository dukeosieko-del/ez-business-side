/**
 * M-Pesa B2C disbursement is not implemented yet.
 * This helper must never create a fake "processed" payout record.
 */
export async function payoutViaMpesa(_phone: string, _amount: number): Promise<never> {
  throw new Error('M-Pesa B2C payouts are disabled until provider integration and callback verification are complete');
}
