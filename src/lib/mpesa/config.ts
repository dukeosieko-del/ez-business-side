import { env } from '@/lib/config/env';

export const mpesaConfig = {
  consumerKey: env.MPESA_CONSUMER_KEY ?? '',
  consumerSecret: env.MPESA_CONSUMER_SECRET ?? '',
  passkey: env.MPESA_PASSKEY ?? '',
  shortcode: env.MPESA_SHORTCODE ?? '',
  baseUrl: 'https://sandbox.safaricom.co.ke/mpesa',
} as const;