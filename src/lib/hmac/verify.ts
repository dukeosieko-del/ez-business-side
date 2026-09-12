import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/lib/config/env';

export async function verifyHmacSignature(
  body: unknown,
  providedSignature: string
): Promise<boolean> {
  const expected = createHmac('sha256', env.HMAC_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  if (expected.length !== providedSignature.length) return false;

  return timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
}