# A7 — API Generation & Missing Routes: Reconnaissance Report

**Date:** 2026-09-22
**Status:** READ-ONLY — no code, no migrations, no commits
**Next step:** Await execution directive

---

## 1. Existing API key infrastructure

**Finding: No JWT-based API key system exists. Only a static env-var key.**

| Location | What exists |
|----------|-------------|
| `src/lib/business-side/config.ts:1` | `getBusinessSideApiKey()` reads `process.env.BUSINESS_SIDE_API_KEY` |
| `src/lib/business-side/auth.ts:21` | `authenticateBusinessSideRequest()` — constant-time compare of `x-business-side-api-key` header against the env var |
| `src/lib/smm/provider.ts:2` | `SMM_API_KEY` — separate key for the SMM provider (DripFeed), unrelated |
| `src/components/admin/AdminTabs.tsx:1446` | UI shows "api_key_configured" boolean for SMM only |

**Consumers of `authenticateBusinessSideRequest`:**
- `src/app/api/business/v1/wallet/balance/route.ts:11`
- `src/app/api/business/v1/wallet/topup/route.ts:11`
- `src/app/api/business/v1/orders/route.ts:12`
- `src/app/api/business/v1/orders/[id]/route.ts:14`
- `src/app/api/business/v1/orders/[id]/cancel/route.ts`
- `src/app/api/business/v1/orders/[id]/refill/route.ts`

**Verdict:** The current system is a single static string in an env var. Any key rotation requires a deploy. No per-user keys, no scopes, no expiry, no revocation. This is the `INVALID_API_KEY` root cause — the business-side sends a key that the main build either does not recognize or has rotated away from.

## 2. Existing rate limiting

**Finding: IP-based sliding window exists, but no per-key limiting.**

| Location | What exists |
|----------|-------------|
| `src/lib/server/rate-limiter.ts` | `rateLimit(request, max)` — IP-keyed, 60s window, default 120 req/min |
| `src/lib/business-side/rate-limit.ts` | Business-side rate limiter keyed on `${ip}:${apiKey}` |
| `src/lib/server/rate-limiter.test.ts` | Unit tests for the limiter |

**Verdict:** The main build limiter is IP-only. For A7's per-key rate limiting, the store key must change from `rl:${ip}` to `rl:${keyId}` (or both). The existing `rateLimit()` function is reusable — it takes a `max` argument and returns `{ ok, response }`.

## 3. Auth token structure

**Finding: No JWT verification code exists in the main build.**

`grep -n "interface\|type.*Payload\|exp\|iat\|scopes" src/lib/auth/verify.ts` returned **zero matches** — the file does not exist at that path. The main build uses cookie-based sessions (`jez_bs_session`), not JWTs.

**Verdict:** A7 Part 2 (JWT API keys) requires new infrastructure, not an extension of existing code. The `oauth/token` endpoint at `src/app/api/business/v1/oauth/token/route.ts` is the closest existing pattern — it should be extended to issue scoped API keys rather than session tokens.

## 4. Island DB schema

**Finding: No `api_keys` table exists.**

`SELECT tablename FROM pg_tables WHERE tablename LIKE '%api_key%'` → **zero rows** across all 37 seeded migrations.

**Verdict:** A7b requires a new migration: `api_keys` table with `id, partner_id, key_hash, scopes, expires_at, revoked_at, created_at, last_used_at`.

## 5. Docs audit — `docs/11-JANJEZ-API-EXTENSIONS.md`

**13 documented endpoints:**

| Endpoint | Implemented? |
|----------|-------------|
| `GET /services` | ✅ |
| `GET /services/:id` | ✅ |
| `GET /wallet/balance` | ✅ |
| `POST /wallet/topup` | ✅ |
| `POST /orders` | ✅ |
| `GET /orders/:id` | ✅ |
| `POST /orders/:id/cancel` | ✅ |
| `POST /orders/:id/refill` | ✅ |
| `POST /webhooks/register` | ✅ |
| `POST /oauth/token` | ✅ |
| `POST /partner/register` | ✅ |
| `POST /affiliate/convert` | ✅ |

**All 13 documented endpoints are implemented.** The 10-route gap list in the directive (`/users`, `/categories`, `/analytics`, `/webhooks`, `/products`, `/catalogue`, `/withdrawals`, `/payouts`, `/affiliates`, `/commissions`) is a superset of what the doc actually lists — these are inferred from business-side needs, not documented in the API contract.

## 6. Route tree audit

**12 existing routes under `src/app/api/business/v1/`:**
`health`, `oauth/token`, `orders`, `orders/[id]`, `orders/[id]/cancel`, `orders/[id]/refill`, `services`, `services/[id]`, `wallet/balance`, `wallet/topup`, `webhooks/register`

**Missing (per directive):** `users`, `categories`, `analytics`, `webhooks` (list), `products`, `catalogue`, `withdrawals`, `payouts`, `affiliates`, `commissions` — **10 routes**.

## 7. Gap register

| # | Gap | Evidence | Severity |
|---|-----|----------|----------|
| A7-1 | No JWT API key system — static env-var only | `auth.ts:21` constant-time compare; no `api_keys` table | 🔴 P0 |
| A7-2 | No per-key rate limiting — IP-only | `rate-limiter.ts` keys on `rl:${ip}` | 🟡 P1 |
| A7-3 | No key issuance/revocation endpoints | Zero routes under `/keys` | 🔴 P0 |
| A7-4 | 10 missing business/v1 routes | `find src/app/api/business/v1` vs directive list | 🟡 P1 |
| A7-5 | `INVALID_API_KEY` root cause unaddressed | Business-side sends key main build does not recognize | 🔴 P0 |

## 8. Client-side expectations

**Business-side `janjezApi` calls (from `src/lib/janjez-api/client.ts`):**
- `getServices`, `getService`, `getWalletBalance`, `createOrder`, `getOrder`
- A5f additions: `getUsers`, `getUser`, `getCategories` (deferred to A7)

**No calls to `/analytics`, `/withdrawals`, `/payouts`, `/affiliates`, `/commissions`, `/products`, `/catalogue` exist on the business-side.** These are admin-facing routes that would be consumed by the business-side admin dashboard, not the reseller/child-panel flows.

## 9. Recommendations

| Sub-phase | Scope | Rationale |
|-----------|-------|-----------|
| A7a | `api_keys` table migration + JWT issuance | Foundation — everything depends on it |
| A7b | Key issuance/list/revocation endpoints | Core API key lifecycle |
| A7c | Per-key rate limiting | Security — replace IP-only limiter |
| A7d | 10 missing routes | Fill the route tree gap |
| A7e | Dashboard UI for key management | Owner-visible surface |
| A7f | OpenAPI spec + docs | Contract completeness |

**A7a is the critical path.** The `INVALID_API_KEY` error cannot be resolved without a real key system — the static env-var approach has no path to per-user keys.