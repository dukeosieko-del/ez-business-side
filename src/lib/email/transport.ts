const BREVO_API_KEY = process.env.BREVO_API_KEY;

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!BREVO_API_KEY) {
    console.log(`Email to ${to}: ${subject}`);
    return;
  }
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL ?? 'noreply@business.janjez.social', name: 'Janjez Business Side' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
  } catch (err) {
    console.error('Brevo send failed:', err);
  }
}
