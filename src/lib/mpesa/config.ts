import { env } from '@/lib/config/env';

const callbackBase = env.MPESA_CALLBACK_URL ?? `${env.NEXT_PUBLIC_SITE_URL}/api/partner/activate/callback`;
const activationCallback = new URL(callbackBase);
if (env.MPESA_CALLBACK_TOKEN) activationCallback.searchParams.set('token', env.MPESA_CALLBACK_TOKEN);

export const mpesaConfig = {
  consumerKey: env.MPESA_CONSUMER_KEY ?? '',
  consumerSecret: env.MPESA_CONSUMER_SECRET ?? '',
  passkey: env.MPESA_PASSKEY ?? '',
  shortcode: env.MPESA_SHORTCODE ?? '',
  callbackUrl: activationCallback.toString(),
  callbackToken: env.MPESA_CALLBACK_TOKEN ?? '',
  livePaymentsEnabled: env.MPESA_LIVE_PAYMENTS_ENABLED === 'true',
  b2cInitiatorName: env.MPESA_B2C_INITIATOR_NAME ?? '',
  b2cSecurityCredential: env.MPESA_B2C_SECURITY_CREDENTIAL ?? '',
  b2cShortcode: env.MPESA_B2C_SHORTCODE ?? '',
  b2cResultUrl: env.MPESA_B2C_RESULT_URL ?? '',
  b2cTimeoutUrl: env.MPESA_B2C_TIMEOUT_URL ?? '',
  baseUrl: env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke',
} as const;
