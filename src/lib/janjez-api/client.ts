import { createHmac, randomUUID } from 'crypto';
import { env } from '@/lib/config/env';

interface JanjezRequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: Record<string, unknown>;
  idempotencyKey?: string;
}

async function signRequest(
  method: string,
  path: string,
  body: string,
  timestamp: string,
  nonce: string
): Promise<string> {
  const bodyHash = createHmac('sha256', env.JANJEZ_MAIN_API_SECRET)
    .update(body)
    .digest('hex');
  const payload = `${method}\n${path}\n${bodyHash}\n${timestamp}\n${nonce}`;
  return createHmac('sha256', env.JANJEZ_MAIN_API_SECRET)
    .update(payload)
    .digest('hex');
}

export async function callJanjez<T>(
  options: JanjezRequestOptions
): Promise<T> {
  const { method, path, body = {}, idempotencyKey } = options;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  const bodyString = method === 'GET' ? '' : JSON.stringify(body);
  const signature = await signRequest(method, path, bodyString, timestamp, nonce);

  const response = await fetch(`${env.JANJEZ_MAIN_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Business-Side-API-Key': env.JANJEZ_MAIN_API_KEY,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Signature': signature,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: method === 'GET' ? undefined : bodyString,
    signal: AbortSignal.timeout(30000),
  });

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Janjez API error');
  }

  return json.data as T;
}

export const janjezApi = {
  getServices: () => callJanjez({ method: 'GET', path: '/services' }),
  getService: (id: string) => callJanjez({ method: 'GET', path: `/services/${id}` }),
  getWalletBalance: () => callJanjez({ method: 'GET', path: '/wallet/balance' }),
  createOrder: (payload: Record<string, unknown>, idempotencyKey: string) =>
    callJanjez({ method: 'POST', path: '/orders', body: payload, idempotencyKey }),
  getOrder: (id: string) => callJanjez({ method: 'GET', path: `/orders/${id}` }),
};
