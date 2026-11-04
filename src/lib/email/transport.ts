export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email is not configured: BREVO_API_KEY and BREVO_SENDER_EMAIL are required');
  }
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { email: senderEmail, name: 'Janjez Business Side' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Brevo rejected email request (${response.status}): ${responseText.slice(0, 300)}`);
  }
}
