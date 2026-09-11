import { createHmac } from 'crypto';
import { env } from '@/lib/config/env';

export async function verifyHmacSignature(body: unknown, signature: string): Promise<boolean> {
  try {
    const expected = createHmac('sha256', env.HMAC_SECRET).update(JSON.stringify(body)).digest('hex');
    return signature === expected;
  } catch {
    return false;
  }
}