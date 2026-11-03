# Error catalog — Business Side

**Audit date:** 2026-11-03  
**Scope:** Business Side repository and its dedicated Supabase project only.

| Area | Confirmed defect | User-visible effect | Repair |
|---|---|---|---|
| Admin session | Admin guard compared opaque `jez_bs_session` cookie to `partners.id`, but the cookie is a random token stored as a SHA-256 hash in `sessions.token_hash`. | Admin routes reject a valid session and redirect to home. | Resolve the session via `getSession()`, then check `partners.is_admin` using the resolved partner UUID. |
| Withdrawals | Source queried `withdrawals` and wrote `phone`, `pending_admin_approval`, `rejection_reason`, and `rejected_at`; live schema has `withdrawal_requests`, `mpesa_number`, `rejected_reason`, and constrained statuses. | Request creation, queue listing, and rejection fail against the actual schema. | Use the live `withdrawal_requests` contract and statuses. |
| Affiliate statistics | Stats route used `sessions.partner_id` as `affiliates.janjez_user_id`. | Affiliate dashboard statistics fail for valid partner sessions. | Resolve partner, then query affiliate using `partners.janjez_user_id`. |
| Wallet top-up | Authenticated POST credited a client-supplied amount via `credit_wallet` without a verified payment callback. | Unbacked wallet credit risk. | Disable top-ups until payment verification and idempotent settlement exist. |
| Wallet UI | Balance and transaction components swallowed API errors and rendered zero/empty data. | A failed API request looked like an empty wallet. | Show loading and error states; return API failures explicitly. |
| Email | Missing Brevo credentials caused console logging and a successful return; non-2xx responses were ignored. | Transactional emails could be dropped silently. | Require configured credentials/sender and throw on provider failure. |

## Configuration / operational findings

- Production Vercel project: `ez-business-side`; production deployment at audit start was READY on `feature/a4a-schema-foundation`.
- Production environment is missing `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`.
- The domain `janjez.social` is authenticated in Brevo, but there was no verified sender under that domain in the sender lookup.
- Runtime error aggregation returned no clusters for the selected seven-day window. Authenticated browser end-to-end checks remain pending.
- Production dependency audit previously reported 40 findings (3 low, 35 moderate, 1 high, 1 critical); fresh lockfile audit and dependency remediation remain outstanding.
- Some Vercel environment records carry platform readable-secret warnings. Values were not inspected or disclosed; review and rotate affected credentials through the provider dashboard if access is broader than intended.

## Safety boundaries

- No production wallet balance, payment, withdrawal, customer, or bulk-email operation was executed.
- Automated withdrawal approval and M-Pesa payout remain disabled pending verified B2C integration and ledger reconciliation.
- No Supabase migration or RLS policy was applied.
- Frozen Janjez main app and database were not accessed.

## Repair branch / preview update — 2026-11-03

- Fixed admin authorization to resolve the opaque session token through `sessions.token_hash` before checking `partners.is_admin`.
- Corrected affiliate identity lookup to resolve `partners.janjez_user_id`; affiliate registration now uses the live `affiliate_code` schema column and is idempotent for an existing affiliate.
- Corrected withdrawal creation, history, and rejection to use `withdrawal_requests`, its actual `mpesa_number` / `rejected_reason` columns, and allowed `pending` status.
- Automated approval and wallet top-ups deliberately return 503 until payout integration / verified payment settlement is complete. No money is moved.
- Added wallet error/loading states, partner-scoped wallet history, and the withdrawal request form on the wallet page.
- Brevo transport now requires `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` and surfaces provider failures.
- Preview build `dpl_3zJ8MQ9aKyDYm7zRsVg3SYqFZYLC` READY; route and health checks recorded in `docs/BUILD-RECORD.md`.
- Remaining blockers: authenticated end-to-end verification; production Brevo credentials/sender; 40 npm audit findings; automated payout/payment integrations.

- Follow-up hardening: affiliate registration now writes the actual `affiliate_code` column and is idempotent; affiliate payout lookup now resolves partner identity before selecting the affiliate.
- Legacy withdrawal approval and fake M-Pesa payout helpers now fail closed rather than debit or create synthetic paid transactions.
