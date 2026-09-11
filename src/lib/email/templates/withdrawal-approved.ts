export function withdrawalApprovedEmail(name: string, email: string, amount: number) {
  return {
    to: email,
    subject: 'Withdrawal Approved',
    html: `<h1>Withdrawal Approved</h1><p>KES ${amount.toLocaleString()} is on its way.</p>`,
  };
}