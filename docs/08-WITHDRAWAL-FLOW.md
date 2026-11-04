# Withdrawal flow — Business Side

## Partner request

1. The partner signs in and receives the opaque `jez_bs_session` cookie.
2. Server-side authentication hashes the cookie and resolves an unexpired row in `sessions`.
3. The server loads the partner's stored phone number; the client cannot nominate a payout destination.
4. The server validates a whole-KES amount of at least KES 500, calculates the configured fee, and inserts a `withdrawal_requests` row with status `pending`.
5. The partner can view only their own requests at `/dashboard/withdrawals`.

## Admin review

- `/admin/withdrawals` is the read-only administrative queue.
- Rejection is permitted only for a request still in `pending`, and writes the schema column `rejected_reason`.
- Automated approval is disabled. It must not debit a wallet or mark a payout paid until M-Pesa B2C credentials, callback validation, idempotency, and ledger reconciliation are verified.

## Live schema

`withdrawal_requests`: `id`, `partner_id`, `amount`, `fee`, `net_amount`, `mpesa_number`, `status`, `approved_by`, `approved_at`, `rejected_reason`, `paid_at`, `mpesa_receipt`, `created_at`, `updated_at`.

Allowed statuses: `pending`, `approved`, `rejected`, `processing`, `paid`, `failed`.

## Operational safety

- A withdrawal request is not a payout instruction.
- No wallet debit occurs when the partner submits a request.
- Do not enable automated approval or M-Pesa disbursement until a real provider transaction can be correlated to a request and reconciled exactly once.
