export function partnerWelcomeEmail(name: string, email: string) {
  return {
    to: email,
    subject: 'Welcome to Janjez Business Side',
    html: `<h1>Welcome, ${name}!</h1><p>Your partner account has been created.</p>`,
  };
}