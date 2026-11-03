import { env } from '@/lib/config/env';

const MPESA_ENV = env.MPESA_ENV;

export const mpesaConfig = {
  consumerKey: env.MPESA_CONSUMER_KEY ?? '',
  consumerSecret: env.MPESA_CONSUMER_SECRET ?? '',
  passkey: env.MPESA_PASSKEY ?? '',
  shortcode: env.MPESA_SHORTCODE ?? '',
  baseUrl:
    MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke',
  callbackUrl:
    env.MPESA_CALLBACK_URL ??
    `${env.NEXT_PUBLIC_SITE_URL}/api/partner/activate/callback`,
} as const;