export function sendEmail(to: string, subject: string, html: string): Promise<void> {
  // Fire-and-forget email send
  // In production, integrate with Brevo/SendGrid
  console.log(`Email to ${to}: ${subject}`);
  return Promise.resolve();
}