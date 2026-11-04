import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.toLowerCase();
  const smtpLogin = process.env.BREVO_SMTP_LOGIN;
  const smtpKey = process.env.BREVO_SMTP_KEY;

  const result = {
    apiKeyConfigured: Boolean(apiKey),
    apiAuthVerified: false,
    senderEmailConfigured: Boolean(senderEmail),
    senderRegistered: false,
    senderActive: false,
    smtpCredentialsConfigured: Boolean(smtpLogin && smtpKey),
    smtpAuthVerified: false,
    transactionalReady: false,
  };

  if (apiKey) {
    try {
      const accountResponse = await fetch('https://api.brevo.com/v3/account', {
        headers: { accept: 'application/json', 'api-key': apiKey },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
      result.apiAuthVerified = accountResponse.ok;

      if (accountResponse.ok && senderEmail) {
        const sendersResponse = await fetch('https://api.brevo.com/v3/senders?limit=50', {
          headers: { accept: 'application/json', 'api-key': apiKey },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        });
        if (sendersResponse.ok) {
          const payload = await sendersResponse.json() as { senders?: Array<{ email?: string; active?: boolean }> };
          const sender = payload.senders?.find((item) => item.email?.toLowerCase() === senderEmail);
          result.senderRegistered = Boolean(sender);
          result.senderActive = sender?.active === true;
        }
      }
    } catch {
      // Keep the response limited to safe configuration/verification booleans.
    }
  }

  result.transactionalReady = result.apiAuthVerified && result.senderRegistered && result.senderActive;
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
