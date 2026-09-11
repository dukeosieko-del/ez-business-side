export function affiliateCommissionEmail(name: string, email: string, amount: number) {
  return {
    to: email,
    subject: 'Commission Earned',
    html: `<h1>Commission Earned</h1><p>You earned KES ${amount.toLocaleString()}.</p>`,
  };
}