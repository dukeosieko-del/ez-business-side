export function withdrawalPaidEmail(name: string, email: string, amount: number) {
  return {
    to: email,
    subject: 'Withdrawal Paid',
    html: `<h1>Withdrawal Paid</h1><p>KES ${amount.toLocaleString()} has been sent via M-Pesa.</p>`,
  };
}