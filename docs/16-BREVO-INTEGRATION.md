# Brevo transactional and communication email

Business Side sends transactional email through Brevo's `POST /v3/smtp/email` API. It does not use the Main app's email transport.

## Server configuration

Set these as encrypted environment variables in the Business Side Vercel project only:

| Variable | Purpose |
|---|---|
| `BREVO_API_KEY` | Server-side API authentication |
| `BREVO_SENDER_EMAIL` | Verified sender address |
| `BREVO_SMTP_LOGIN` | SMTP relay login (only if SMTP transport is enabled) |
| `BREVO_SMTP_KEY` | Dedicated SMTP key; not the API key |
| `BREVO_SMTP_HOST` | `smtp-relay.brevo.com` |
| `BREVO_SMTP_PORT` | `587` (STARTTLS) or `465` (TLS) |

The current application transport uses the transactional API. SMTP login/key presence is shown separately in the admin integration health page; SMTP relay authentication is not yet tested by the app.

## Sender readiness

A sender must exist and be active in Brevo, and its domain must be authenticated. The Business Side health endpoint verifies API access and matches the configured sender address against the account's sender list. It never returns credential values and never sends a message.

## Email categories

- Transactional: activation status, account security, withdrawal status, order receipt/completion/failure.
- Operational communication: account and service notices tied to an explicit user action.
- Marketing campaigns: draft-only until separately approved and configured in Brevo. Never use transactional mail to send unsolicited marketing.

## Safety

- Do not store API keys or SMTP keys in the database, source code, client state, or logs.
- Do not use the Brevo API key as the SMTP password. Create a separate SMTP key in Brevo.
- Test messages go only to a recipient explicitly named and confirmed by the account owner.
- A successful API request means queued/accepted by Brevo, not guaranteed inbox delivery.
- The dashboard status page performs read-only account/sender checks only.
