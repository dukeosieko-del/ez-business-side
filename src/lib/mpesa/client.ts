import crypto from 'crypto';
import { mpesaConfig } from './config';

interface MpesaResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  CheckoutRequestID?: string;
}

function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
}

function buildPassword(): string {
  const timestamp = generateTimestamp();
  const raw = `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`;
  return Buffer.from(raw).toString('base64');
}

function signRequest(body: unknown, secret: string): string {
  const payload = JSON.stringify(body);
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getAccessToken(): Promise<MpesaResponse<{ access_token: string; expires_in: number }>> {
  try {
    const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');

    const res = await fetchWithTimeout(
      `${mpesaConfig.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!res.ok) {
      return { success: false, error: `Token request failed: ${res.status}` };
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function callMpesa<T>(
  endpoint: string,
  body: Record<string, unknown>,
  useHmac = true
): Promise<MpesaResponse<T>> {
  try {
    const tokenResult = await getAccessToken();
    if (!tokenResult.success || !tokenResult.data) {
      return { success: false, error: tokenResult.error || 'Failed to get access token' };
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${tokenResult.data.access_token}`,
      'Content-Type': 'application/json',
    };

    if (useHmac) {
      const signature = signRequest(body, mpesaConfig.consumerSecret);
      headers['X-Signature'] = signature;
    }

    const res = await fetchWithTimeout(`${mpesaConfig.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { success: false, error: `API request failed: ${res.status}` };
    }

    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function initiateStkPush(
  phone: string,
  amount: number,
  idempotencyKey: string
): Promise<MpesaResponse<{ CheckoutRequestID: string }>> {
  const timestamp = generateTimestamp();
  const password = buildPassword();

  const result = await callMpesa<{ CheckoutRequestID: string }>(
    '/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: phone,
      ReturnURL: 'https://example.com/callback',
      InvoiceNo: idempotencyKey,
      OrgAccountReference: idempotencyKey,
      TransactionDesc: 'Account activation',
    },
    true
  );

  return result;
}

export async function queryStkStatus(
  checkoutRequestID: string
): Promise<MpesaResponse<{ CheckoutRequestID: string; ResultCode: number; ResultDesc: string }>> {
  const timestamp = generateTimestamp();
  const password = buildPassword();

  const result = await callMpesa<{ CheckoutRequestID: string; ResultCode: number; ResultDesc: string }>(
    '/mpesa/stkpush/v1/query',
    {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    },
    true
  );

  return result;
}