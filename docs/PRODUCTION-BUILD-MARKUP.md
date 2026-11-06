# Janjez Business Side — Full Production Build Markup (No-Stop Execution Blueprint)

**Scope:** End-to-end production-grade build/ship plan for this repository (Next.js 16.3.5 App Router, React 19, TypeScript, Supabase, Janjez main API, M-Pesa, Vercel target).  
**Source anchors:** `package.json`, `next.config.ts`/`next.config.js`, `src/middleware.ts`, `instrumentation.ts`, `src/lib/config/env.ts`, `src/lib/auth/session.ts`, `app/api/auth/*`, `app/api/health/*`, `supabase/migrations/*`, `docs/*`, `.env.example`.

---

## 0. Production Definition of Done (gate — nothing ships without all green)

| Gate | Requirement | Evidence |
|---|---|---|
| Build | `npm ci && npm run build` exits 0 on clean env | CI artifact + logs |
| Types | `tsc --noEmit` (or build typecheck) passes | CI |
| Lint | `npm run lint` passes with zero warnings policy (or documented baseline) | CI |
| Unit/Integration | All tests pass; critical paths covered (auth, money, orders, webhooks, idempotency) | JUnit/coverage report |
| E2E | Smoke flows pass on staging: sign-in → dashboard → panel/service/order/wallet/withdrawal happy + failure paths | Playwright report |
| Migrations | All `supabase/migrations/*` applied idempotently; rollback/runbook documented | migration log |
| Secrets | No secrets in git; runtime env validated; rotation documented | secret scan + env checklist |
| Security | AuthZ on every mutating/protected route; webhook signature verified; rate limits on abuse surfaces; headers set | security checklist |
| Observability | Sentry + structured logs + health checks + alerts wired | dashboards/alert tests |
| Performance | P95 budgets met; no N+1 on hot paths; caching/ISR strategy defined | profiling notes |
| Operations | Deploy, rollback, incident, backup/restore, secret rotation runbooks tested | runbook sign-off |
| Data safety | Idempotency on payments/orders/webhooks; audit log on sensitive actions | code + tests |

---

## 1. Target Production Architecture

### 1.1 Runtime topology
- **Edge/Middleware:** `src/middleware.ts` — tenant resolution (`partners.janjez.social`, `*.partners.janjez.social` rewrite to `/{subdomain}`, custom domain path), public/protected path gating, affiliate click side-effect (`fetch` to `/api/affiliate/track/click`), `x-jez-panel-*` injection for child-panel requests.
- **App runtime:** Next.js App Router, Node runtime for server routes using `server-only`/admin clients (`instrumentation.ts` registers Sentry on `nodejs`).
- **Data:** Supabase Postgres (own project, ref noted in `docs/BUILD-RECORD.md`: `fjkzrhyxmjtejjarlxxz`) + service-role admin access via `src/lib/supabase/server.ts` (`getSupabaseAdmin`).
- **External integrations:** Janjez Main API (`src/lib/janjez-api/client.ts`, HMAC-SHA256 signed requests, 30s timeout), M-Pesa Daraja (activation/topup callbacks), Sentry (`@sentry/nextjs`), Better Stack token placeholder.
- **Hosting:** Vercel (`vercel deploy --prod`), canonical domain `business.janjez.social` / partner hub `partners.janjez.social` / child subdomains.

### 1.2 Tenancy model (must be explicit everywhere)
- **Partner hub:** root/partner domain → dashboard/partner/admin flows.
- **Child panel:** `*.partners.janjez.social` rewritten to `/{subdomain}`; middleware sets `x-jez-panel-id`, `x-jez-panel-subdomain` (note: current resolver sets `panelId: ''` for subdomain match — production must resolve real `panelId` from DB/cache and fail closed if unknown/published state invalid).
- **Custom domain:** `custom-domain` tenant result; production must map hostname → panel with verified domain status, TLS/host allowlist, and cache invalidation on verify.
- **Isolation rule:** every child-panel/order/service/user query MUST be scoped by resolved `panel_id`/tenant; never trust client-supplied panel identifiers without ownership verification.

### 1.3 Request trust boundaries
| Boundary | Control |
|---|---|
| Browser → partner routes | `jez_bs_session` cookie (HttpOnly, Secure in prod, SameSite=Lax, 30d) + server session lookup in `sessions` table (SHA-256 token hash, expiry). |
| Browser → child routes | child auth/session mechanism (see `app/api/child/auth/*`, `child_users_session` migration) — verify route-level enforcement. |
| Server → Janjez | HMAC signature (`X-Business-Side-API-Key`, `X-Timestamp`, `X-Nonce`, `X-Signature`, optional `Idempotency-Key`), 30s timeout. |
| M-Pesa/Janjez → webhooks | Signature/secret verification, replay protection (timestamp/nonce/idempotency), strict schema validation, audit log, 2xx only after durable handling. |
| Admin actions | explicit admin authorization check (not just session existence); audit every approve/reject/publish/sensitive mutation. |

---

## 2. Repository & Config Hardening (do first, no shortcuts)

### 2.1 Resolve config drift
- **`next.config.ts` vs `next.config.js`:** keep one authoritative config. Production recommendation: single `next.config.ts` (or `.mjs`) with `output: 'standalone'` if containerized, or remove conflicting file to avoid undefined precedence. Add explicit security headers, image domains (if any), `poweredByHeader: false`, strict `reactStrictMode: true` where compatible, and Sentry webpack config if using `@sentry/nextjs` build integration.
- **Package scripts (add/normalize):**
  - `lint`: keep `eslint` or `next lint` consistently; enforce in CI.
  - `typecheck`: `tsc --noEmit -p tsconfig.json` (or `next typegen` + tsc as needed).
  - `test`: unit/integration runner (Jest config exists; add script).
  - `test:e2e`: Playwright (`playwright.config.ts` exists).
  - `test:ci`: deterministic CI command.
  - `verify`: `npm run lint && npm run typecheck && npm run test && npm run build`.
- **Dependency hygiene:** `jest`, testing libs, and `jsdom` are in `dependencies` — move test-only packages to `devDependencies` for production image size/attack surface. Pin/lock via `package-lock.json` (`npm ci` only in CI/prod build). Run `npm audit --omit=dev` gate and track exceptions.
- **`.gitignore`:** confirm `.env`, `.env.*` (except `.env.example`), `.vercel`, test artifacts, coverage, Playwright reports, Sentry artifacts are ignored. Never commit service keys.

### 2.2 Environment model
- **Validation:** `src/lib/config/env.ts` uses Zod; build phase allows partial parse (`NEXT_PHASE=phase-production-build`) — acceptable only if no runtime path executes without full validation. Add a **runtime fail-fast** assertion in Node bootstrap for required production vars (no silent empty strings in `createSupabaseClient`/admin paths).
- **Production env checklist (all required unless marked optional):**
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Janjez: `JANJEZ_MAIN_API_URL`, `JANJEZ_MAIN_API_KEY`, `JANJEZ_MAIN_API_SECRET`.
  - Site/tenant: `NEXT_PUBLIC_SITE_URL` (must match canonical deployment URL), `NEXT_PUBLIC_PARTNER_HUB_DOMAIN`.
  - Security: `HMAC_SECRET` (>=32 chars; ensure actually used where intended — audit for dead config), `SESSION_COOKIE_NAME` if overridden.
  - M-Pesa (required for activation/topup in prod): `MPESA_ENV=production`, `MPESA_CONSUMER_KEY/SECRET/PASSKEY/SHORTCODE`.
  - Observability: valid `SENTRY_DSN` (`https://...`) or unset; `BETTER_STACK_TOKEN` if used.
  - Business knobs: `PARTNER_ACTIVATION_FEE`, `WITHDRAWAL_FEE_PERCENT`, `WITHDRAWAL_MIN_AMOUNT`, `IDEMPOTENCY_TTL_SECONDS` — validate numeric ranges.
- **Per-environment separation:** dev/staging/prod Supabase projects, M-Pesa sandbox vs production, distinct Janjez credentials, distinct Sentry environments. Never point staging at prod money/webhook endpoints.

---

## 3. Security & Compliance (tiny details matter)

### 3.1 Authentication/session
- **Cookie:** `HttpOnly`, `Secure` (prod), `SameSite=Lax` (evaluate `Strict` for non-cross-site flows), explicit `Path=/`, bounded expiry, rotation on privilege-sensitive events. `SESSION_COOKIE_NAME` env must be honored consistently (currently hardcoded `'jez_bs_session'` in session/middleware — unify).
- **Token storage:** only SHA-256 hash in DB (`sessions.token_hash`) — good; ensure constant-time comparisons where applicable and index on `token_hash`/`expires_at`.
- **Session payload:** `getSession()` returns `janjez_user_id: ''` — populate if needed for authorization/audit, or remove misleading field.
- **Logout:** delete cookie + DB session row; optionally revoke all sessions endpoint for compromised accounts.
- **SSO sync (`/api/auth/sync`, `/api/auth/check`):** protect against CSRF/origin abuse (server-to-server/internal flow should be authenticated by a shared secret or restricted caller, not open internet POST with arbitrary `janjez_user_id`). Validate `redirectTo` targets against allowlist. `AbortSignal.timeout(15000)` is fine; log failures with correlation IDs, never leak internals.

### 3.2 Authorization
- Enforce **deny-by-default** on every `/api/partner/*`, `/api/admin/*`, `/dashboard/*` data path. Session presence is insufficient for admin — check role/claim in `partners`/admin table.
- Enforce **resource ownership**: `partner_id` must own `panel_id`, wallet, withdrawal, orders viewed/mutated.
- Child-panel APIs must authorize child user/panel context; anonymous orders only where explicitly designed (`child_orders.child_user_id` nullable).

### 3.3 Input validation & API safety
- Zod-schema every request body/query/param at route boundary; reject unknown/oversized payloads.
- Standard error shape (align with `docs/06-ERROR-CATALOG.md` when populated): `{ success:false, error:{ code, message, details? }, requestId }`. Never return stack traces/SQL/provider internals in prod.
- **Rate limiting:** required on auth, OTP-like flows, affiliate tracking, webhooks ingress metadata, order creation, wallet/topup, withdrawal requests, admin mutations. (No `rate-limit.ts` found in `src/lib/middleware` — implement centralized limiter: Upstash Redis/Vercel KV or DB-backed token bucket; key by IP + user + route.)
- **Idempotency:** apply to all money/order/webhook/activation endpoints (`src/lib/middleware/idempotency.ts` exists — wire consistently; include `Idempotency-Key` scope by endpoint+actor; store response safely; handle in-flight conflicts).
- **CSRF:** cookie-auth POST/PUT/PATCH/DELETE from browsers need CSRF mitigation (SameSite alone may not cover all cases; add origin check or double-submit token for state-changing forms if applicable).

### 3.4 Webhooks & money
- **Janjez order-status webhook (`/api/webhooks/janjez/order-status`):** verify HMAC/signature + timestamp window + nonce replay cache; parse strict schema; idempotent by external event/order ID; transactionally update order + audit; return 200 only after durable commit.
- **M-Pesa callbacks (activation):** verify callback authenticity per Daraja flow, validate amount/MSISDN/receipt against expected pending activation, idempotent by checkout/request/receipt ID, atomic partner activation + wallet/audit updates.
- **Withdrawals/commissions:** server-side calculation only; DB constraints for min amount/fee bounds; state machine transitions enforced; admin approval audited with actor/IP/UA.

### 3.5 HTTP/security headers (Next/Vercel)
Set via `next.config` headers: `Strict-Transport-Security` (preload after validation), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` or CSP `frame-ancestors` (adjust if embed required), `Permissions-Policy` minimal, CSP tuned for Supabase/Sentry/assets (start report-only in staging). Ensure no sensitive caching on auth/wallet/admin responses (`Cache-Control: no-store`).

### 3.6 Secrets & supply chain
- Rotate all secrets before go-live; least privilege Supabase service role usage (isolate admin client to server-only modules — `server-only` import in env is good; extend pattern).
- Enable Dependabot/Renovate + CI audit; review `@sentry/nextjs`/Next major compatibility on upgrades.
- Log redaction: Sentry `beforeSend` strips auth headers — also redact API keys, M-Pesa secrets, HMAC signatures, tokens from app logs.

---

## 4. Data Layer & Migrations (production-safe)

### 4.1 Migration discipline
- Migrations present through `20260918000009_affiliate_commissions.sql` (24 files listed). Run in order on staging first, then prod during controlled window.
- Every migration: forward-only in prod, reviewed for lock/time impact, large-table changes use safe patterns (add nullable/default, backfill in batches, then constrain).
- **Pre-deploy checks:** migration diff reviewed, backup/snapshot taken, rollback strategy defined (compensating migration or restore point — Supabase PITR plan).
- **Post-deploy checks:** verify constraints/indexes/RLS policies (if used), run smoke queries, confirm app can read/write critical tables.

### 4.2 Schema/behavior details to verify
- `partners`: activation fee/status/onboarding transitions, `api_key_hash` lifecycle, wallet balance non-negative invariant (DB + app).
- `child_panels`: domain uniqueness/verification state, publish state gates, branding/copy JSONB schema validation in app.
- `child_services`: unique `(panel_id, janjez_service_id)`, sync idempotency, stale-service handling.
- `child_users`: nullable `password_hash` implications; session table linkage (`child_users_session` migration).
- `child_orders`: nullable `child_user_id`, `janjez_order_id` lifecycle, partial unique idempotency key, status state machine, payment method handling.
- `withdrawal_requests`: min amount CHECK, status transitions, fee calculation consistency with env.
- `affiliates/referrals/clicks/commissions`: hold periods, conversion uniqueness, payout eligibility, fraud/rate controls.
- `sessions`: TTL cleanup job/cron; index for lookup by hash.
- `idempotency_keys`: TTL cleanup (`cleanup_expired_idempotency()` noted in docs) scheduled; ensure unique key+endpoint semantics match code.
- `audit_log`/`audit_logs`: consolidate naming/usage if both exist; immutable append pattern; include `requestId`, actor, IP/UA, before/after metadata (PII-minimized).

### 4.3 RLS / access model decision
If using Supabase anon/authenticated clients anywhere, enforce RLS policies aligned with tenancy. Current admin client uses service role — RLS bypass risk means **all authorization must be in application code**; document and test this explicitly.

---

## 5. API & Domain Implementation Checklist

### 5.1 Auth
- [ ] Unify cookie name source (`env.SESSION_COOKIE_NAME`) across session create/read/destroy and middleware.
- [ ] Harden `/api/auth/sync`: authenticate caller (shared secret/mTLS/internal network) + strict schema + rate limit.
- [ ] `/api/auth/check`: avoid open redirect; ensure `verifyJanjezSession` validates signature/issuer/expiry.
- [ ] Add sign-out CSRF protection if browser-initiated; audit all auth callback paths.

### 5.2 Partner/panel flows
- [ ] Onboarding state machine tested end-to-end (pending → activated → panel created → domain/branding/services published).
- [ ] Panel domain verify: DNS/token challenge verification, timeout, re-verify, safe failure; do not activate unverified custom domains.
- [ ] Branding/logo upload: type/size limits, storage path scoping, malware/content-type checks, CDN/cache headers.
- [ ] Service import/sync: idempotent, diff-aware, error partials reported, rate-limited against Janjez API.

### 5.3 Orders/wallet/withdrawals
- [ ] Order create: idempotency key required for client retries; price/service validation server-side against current catalog; panel/partner scoping.
- [ ] Wallet balance/topup: atomic ledger updates (prefer RPC/transaction), no float money (use integer minor units or numeric with fixed scale), reconciliation fields.
- [ ] Withdrawal: min/fee/available balance checks atomic; payout status tracked; admin actions dual-checked and audited.

### 5.4 Affiliate
- [ ] Click tracking in middleware currently fires non-blocking `fetch` — ensure it cannot DDoS self (rate limit, queue, sample, or move to edge-safe ingestion); validate `ref` format.
- [ ] Conversion/payout: anti-self-referral/fraud checks, idempotent conversion, auditable commission calculations.

### 5.5 Admin
- [ ] All `/api/admin/*` routes require admin authorization middleware/wrapper.
- [ ] Approve/reject withdrawal: idempotent, reason capture, notification hooks optional but logged.

### 5.6 Health/ops endpoints
- [ ] `/api/health`: liveness (`ok`); keep lightweight.
- [ ] `/api/health/db`: DB connectivity/latency; do not expose sensitive details publicly (protect or redact in prod).
- [ ] `/api/health/janjez`: signed downstream check with timeout/circuit awareness; protect from abuse.
- [ ] Add readiness semantics for deploy orchestration if needed.

---

## 6. CI/CD Pipeline (no-stop, deterministic)

### 6.1 CI stages (GitHub Actions or equivalent)
1. **Checkout + setup Node** (LTS compatible with Next 16/React 19).
2. **`npm ci`**.
3. **Static checks:** lint, typecheck.
4. **Unit/integration tests:** coverage threshold on critical modules (`auth`, `session`, `idempotency`, `webhooks`, `money/wallet`, `janjez-api` signing).
5. **Build:** `npm run build` with CI-safe env placeholders only where schema allows build-phase partial parse; fail on warnings if configured.
6. **Security:** dependency audit (policy-based), secret scan, optional SAST.
7. **E2E (staging):** Playwright smoke against deployed preview/staging with seeded test data.
8. **Migration check:** dry-run/validation in staging pipeline (Supabase CLI).

### 6.2 CD
- **Preview:** PR deployments for UI/API review (non-prod secrets, sandbox integrations).
- **Staging:** auto-deploy from main/release branch; run migrations before/with deploy per compatibility; full smoke.
- **Production:** manual approval gate; migrations applied; deploy; smoke; monitor error rate/latency for 15–30 min; rollback ready.
- **Rollback:** instant revert to previous Vercel deployment; DB rollback only via preplanned compensating migration/restore (never ad hoc destructive changes).

---

## 7. Observability & Operations

### 7.1 Logging/monitoring
- Structured JSON logs with `requestId`, `tenant`, `route`, `actorType/id` (non-PII where possible), `durationMs`, `outcome`.
- Sentry: enabled only with valid DSN, environment/release tags, source maps uploaded in CI (auth token in CI secrets), PII scrubbing verified.
- Alerts: 5xx spike, webhook failure rate, auth/sync failures, DB latency/unhealthy, Janjez upstream errors/timeouts, M-Pesa callback failures, withdrawal backlog/anomalies.

### 7.2 Runbooks (expand `docs/13-RUNBOOK.md` / `14-TROUBLESHOOTING.md`)
- Deploy/rollback procedure.
- Migration apply/verify/rollback.
- Secret rotation (Supabase, Janjez, M-Pesa, HMAC, Sentry).
- Incident: payment callback missed/duplicated, stuck order sync, session/auth outage, domain verification failure, 404/502 triage.
- `/pay` and `/orders/all` 404s noted in build record: confirm product intent — implement routes, add redirects/proxy rules, or remove UI links/prefetch to eliminate noise.

### 7.3 Backups/DR
- Supabase PITR/backups enabled; restore drill documented.
- Audit/idempotency/order/wallet data retention policy defined.
- RPO/RTO targets agreed (business decision) and tested.

---

## 8. Performance & Reliability

- **Janjez client:** 30s timeout exists — add bounded retries with exponential backoff only for safe/idempotent reads; never blind-retry non-idempotent money/order creates without idempotency key.
- **DB:** indexes for session lookup, panel domain/subdomain resolution, partner-owned resource queries, order/withdrawal status dashboards; avoid N+1 in admin/partner list pages.
- **Caching:** cache public catalog/panel config carefully with tenant-aware keys and revalidation on publish/sync; never cache personalized/auth/money responses.
- **Middleware cost:** runs broadly (matcher excludes static/image/favicon) — keep logic minimal; avoid DB calls on every request in hot path (use signed headers/cache for panel resolution after first lookup).
- **Large payloads:** enforce body size limits and pagination defaults/caps on list endpoints.

---

## 9. Testing Matrix (minimum production set)

| Area | Cases |
|---|---|
| Auth/session | create/get/destroy, expired hash rejected, cookie flags, sync idempotency/failure, admin vs partner access |
| Tenancy | hub/subdomain/custom-domain resolution, rewrite correctness, panel isolation, unknown host handling |
| Idempotency | duplicate key replay, same key different payload conflict policy, TTL expiry |
| Janjez API | signature correctness, nonce/timestamp, 4xx/5xx mapping, timeout |
| Orders | create/status/webhook idempotency, anonymous vs user order rules, invalid service/price |
| Wallet/withdrawals | insufficient funds, min amount, fee calc, concurrent requests, admin approval state machine |
| M-Pesa activation | callback verify, duplicate receipt, amount mismatch, atomic activation |
| Affiliate | click rate limiting, conversion attribution, commission math/hold |
| UI/E2E | sign-in, dashboard nav, reseller/affiliate pages, child-panel critical path, error states |

---

## 10. Execution Sequence (no-stop, dependency-ordered)

1. **Freeze scope + env inventory:** confirm domains, Supabase/Janjez/M-Pesa/Sentry owners, prod credentials availability.
2. **Config unification:** resolve `next.config` drift, fix scripts, move test deps, add `typecheck/test/verify`.
3. **Security baseline:** unify cookie config, add route-level authZ wrappers, protect admin/sync/webhooks, add rate limiting, wire idempotency to all critical mutations.
4. **Tenant resolution hardening:** DB-backed panel lookup + custom-domain verification + fail-closed behavior.
5. **Money/webhook correctness:** idempotent atomic handlers, signature verification, audit logs, integer/numeric money handling.
6. **Observability:** Sentry release/source maps, structured logs, alert rules, protected health details.
7. **Migration readiness:** staging apply, data validation, cleanup jobs (`sessions`, `idempotency_keys`) scheduled.
8. **CI/CD:** pipeline gates, preview/staging/prod promotion, manual prod approval.
9. **Staging verification:** full test matrix + E2E + webhook sandbox callbacks + load sanity on hot endpoints.
10. **Production cutover:** rotate secrets, apply migrations, deploy, smoke, monitor, announce; keep rollback path warm.
11. **Post-launch (first 72h):** watch error budgets, webhook/activation/withdrawal queues, reconcile wallet/orders, close discovered P1s via hotfix pipeline.

---

## 11. Known Repo-Specific Risks to Address Before Production
- `src/lib/supabase/server.ts` falls back to empty strings — can mask misconfig; fail fast in runtime.
- `next.config.ts` and `next.config.js` coexist — eliminate ambiguity.
- `resolveTenant()` returns `panelId: ''` for child subdomains — insufficient for real authorization/data scoping.
- `/api/auth/sync` trusts posted identity — restrict caller.
- Middleware affiliate click uses fire-and-forget fetch — add abuse controls/backpressure.
- `docs/01/03/06` (API contract/security/error catalog) are sparse — populate as authoritative contracts before scaling team/on-call.
- Test deps in `dependencies`; hero test script points to `.ts` while `.js` spec exists — normalize.
- `SENTRY_DSN` placeholder handling exists, but confirm all envs use valid DSN or empty; invalid DSN must never break startup.

This markup is the build contract: execute in order, attach evidence to each gate, and do not declare production-ready until every Definition-of-Done item is green.
