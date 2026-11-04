import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().optional(),

  JANJEZ_MAIN_API_URL: z.string().url(),
  JANJEZ_MAIN_API_KEY: z.string().min(1),
  JANJEZ_MAIN_API_SECRET: z.string().min(1).optional(),

  MPESA_ENV: z.enum(['sandbox', 'production']),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_CALLBACK_URL: z.string().url().optional(),
  MPESA_CALLBACK_TOKEN: z.string().min(32).optional(),
  MPESA_LIVE_PAYMENTS_ENABLED: z.enum(['true', 'false']).default('false'),
  MPESA_B2C_INITIATOR_NAME: z.string().optional(),
  MPESA_B2C_SECURITY_CREDENTIAL: z.string().optional(),
  MPESA_B2C_SHORTCODE: z.string().optional(),
  MPESA_B2C_RESULT_URL: z.string().url().optional(),
  MPESA_B2C_TIMEOUT_URL: z.string().url().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url(),

  SENTRY_DSN: z.string().optional().refine((v) => !v || v === '<or leave empty>' || v.startsWith('https://') || v.startsWith('http://'), { message: 'Invalid Sentry DSN' }).transform((v) => (!v || v === '<or leave empty>' ? undefined : v)),
  BETTER_STACK_TOKEN: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().optional(),
  BREVO_SMTP_LOGIN: z.string().optional(),
  BREVO_SMTP_KEY: z.string().optional(),
  BREVO_SMTP_HOST: z.string().default('smtp-relay.brevo.com'),
  BREVO_SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),

  PARTNER_ACTIVATION_FEE: z.string().default('1499'),
  WITHDRAWAL_FEE_PERCENT: z.string().default('5'),
  WITHDRAWAL_MIN_AMOUNT: z.string().default('500'),

  SESSION_COOKIE_NAME: z.string().default('jez_bs_session'),
  IDEMPOTENCY_TTL_SECONDS: z.string().default('86400'),
  NEXT_PUBLIC_PARTNER_HUB_DOMAIN: z.string().default('partners.janjez.social'),
  HMAC_SECRET: z.string().min(32),
});

const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';
export const env = (isProductionBuild ? envSchema.partial().parse(process.env) : envSchema.parse(process.env)) as z.infer<typeof envSchema>;
