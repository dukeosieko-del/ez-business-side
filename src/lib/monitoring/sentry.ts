import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/config/env';

export function initSentry(): void {
  if (!env.SENTRY_DSN) return;

  if (!env.SENTRY_DSN.startsWith('https://') && !env.SENTRY_DSN.startsWith('http://')) {
    console.warn('Invalid Sentry DSN, skipping Sentry initialization:', env.SENTRY_DSN);
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['x-business-side-api-key'];
      }
      return event;
    },
  });
}

export { Sentry };
export function captureError(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}