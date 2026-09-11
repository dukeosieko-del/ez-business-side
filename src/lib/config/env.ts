import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  JANJEZ_MAIN_API_URL: z.string().url(),
  JANJEZ_MAIN_API_KEY: z.string().min(1),
  JANJEZ_MAIN_API_SECRET: z.string().min(1),

  MPESA_ENV: z.enum(['sandbox', 'production']),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url(),

  SENTRY_DSN: z.string().optional(),
  BETTER_STACK_TOKEN: z.string().optional(),

  PARTNER_ACTIVATION_FEE: z.string().default('1499'),
  WITHDRAWAL_FEE_PERCENT: z.string().default('5'),
  WITHDRAWAL_MIN_AMOUNT: z.string().default('500'),

  SESSION_COOKIE_NAME: z.string().default('jez_bs_session'),
  IDEMPOTENCY_TTL_SECONDS: z.string().default('86400'),

  NEXT_PUBLIC_PARTNER_HUB_DOMAIN: z.string().default('partners.janjez.social'),

  HMAC_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
