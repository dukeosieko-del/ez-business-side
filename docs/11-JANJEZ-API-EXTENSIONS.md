# Janjez Main — Business Side API Extensions

**Base URL:** `https://janjez.social/api/business/v1/`
**Auth:** HMAC-SHA256 with X-Business-Side-API-Key header
**Version:** v1

## Authentication

Every request includes:

- `X-Business-Side-API-Key: <key>`
- `X-Timestamp: <unix-seconds>`
- `X-Nonce: <uuid-v4>`
- `X-Signature: HMAC-SHA256(secret, METHOD\nPATH\nBODY_HASH\nTIMESTAMP\nNONCE)`
- `Idempotency-Key: <uuid-v4>` (required for POST/PATCH/DELETE)

Reject if:
- Timestamp >5 minutes old
- Nonce reused within 10 minutes
- Signature invalid
- API key unknown or revoked

## Endpoints

### GET /services
Returns full service catalogue.

### GET /services/:id
Single service details.

### GET /wallet/balance
Returns Business Side wallet balance (KES).

### POST /wallet/topup
Initiate M-Pesa STK push to fund the Business Side wallet.

### POST /orders
Create fulfillment order. Requires `Idempotency-Key` header.

### GET /orders/:id
Order status.

### POST /orders/:id/cancel
Cancel order (if provider supports).

### POST /orders/:id/refill
Request refill.

### POST /webhooks/register
Register webhook URL for order events.

### POST /oauth/token
**NEW:** Exchange authorization code for session token (SSO).

### POST /partner/register
Register new partner.

### POST /affiliate/convert
Record affiliate conversion.

## Webhook Security — HMAC Secret Sharing

Janjez main signs outgoing webhooks using HMAC-SHA256. The Business Side verifies them using the **same shared secret** stored in the `HMAC_SECRET` environment variable.

**Shared secret mechanism:**

1. Janjez main and Business Side share a single HMAC secret provisioned during integration setup.
2. The secret is stored as `HMAC_SECRET` in both systems' environment variables.
3. Janjez main signs webhook bodies with `createHmac('sha256', HMAC_SECRET)`.
4. Business Side verifies with `verifyHmacSignature()` in `src/lib/hmac/verify.ts`.
5. The secret is rotated annually or on compromise. Rotation requires updating both systems simultaneously.

**Verification flow:**

```
Janjez main → POST /api/webhooks/janjez/order-status
  Headers:
    x-janjez-signature: <HMAC-SHA256(body, HMAC_SECRET)>
    x-janjez-signature: <HMAC-SHA256(body, HMAC_SECRET)>
  Body: { order_id, status, ... }

Business Side:
  1. Read x-janjez-signature header
  2. Compute HMAC-SHA256(request body, env.HMAC_SECRET)
  3. Compare with timingSafeEqual
  4. If match → process webhook
  5. If mismatch → reject 401
```

**Configuration:**

| Variable | Description | Shared with |
|----------|-------------|-------------|
| `HMAC_SECRET` | HMAC secret for webhook verification | Janjez main |

**See also:** `src/lib/hmac/verify.ts`

All responses:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "request_id": "uuid",
  "timestamp": "2026-09-11T12:00:00Z"
}
```

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| INVALID_SIGNATURE | 401 | HMAC verification failed |
| INVALID_TIMESTAMP | 401 | Timestamp out of window |
| INVALID_NONCE | 401 | Nonce already used |
| KEY_REVOKED | 401 | API key disabled |
| RATE_LIMITED | 429 | Too many requests |
| INSUFFICIENT_BALANCE | 402 | Business Side wallet empty |
| SERVICE_NOT_FOUND | 404 | Service ID invalid |
| INVALID_QUANTITY | 400 | Quantity outside min/max |
| ORDER_ALREADY_EXISTS | 409 | Idempotency key reused with different body |
| PROVIDER_ERROR | 502 | DripFeed API error |
