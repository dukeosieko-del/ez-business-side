import { createHmac, randomUUID } from 'crypto';
import { env } from '@/lib/config/env';

export interface JanjezUser {
  janjez_user_id: string;
  email: string;
  full_name: string;
  phone: string;
}

export interface VerifyResult {
  valid: boolean;
  user?: JanjezUser;
}

export async function verifyJanjezSession(code: string): Promise<VerifyResult> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = randomUUID();
    const body = JSON.stringify({ code, client_id: 'ez-business-side' });
    const bodyHash = createHmac('sha256', env.JANJEZ_MAIN_API_SECRET)
      .update(body)
      .digest('hex');
    const payload = `POST\n/auth/verify\n${bodyHash}\n${timestamp}\n${nonce}`;
    const signature = createHmac('sha256', env.JANJEZ_MAIN_API_SECRET)
      .update(payload)
      .digest('hex');

    const response = await fetch(`${env.JANJEZ_MAIN_API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-Side-API-Key': env.JANJEZ_MAIN_API_KEY,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      body,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { valid: false };
    }

    const json = await response.json();

    if (!json.success || !json.data) {
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        janjez_user_id: json.data.janjez_user_id,
        email: json.data.email,
        full_name: json.data.full_name,
        phone: json.data.phone ?? '',
      },
    };
  } catch {
    return { valid: false };
  }
}