export function activationSuccessEmail(name: string, email: string) {
  return {
    to: email,
    subject: 'Account Activated',
    html: `<h1>Activation Successful</h1><p>Your account ${name} is now active.</p>`,
  };
}