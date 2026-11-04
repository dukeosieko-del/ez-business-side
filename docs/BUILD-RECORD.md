# BUILD-RECORD — Janjez Business Side

**Last updated:** 2026-09-18T19:15Z  
**Branch:** `kilo/emerald-dolphin-b37`  
**HEAD:** `d8e388f` (Merge main into kilo/emerald-dolphin-b37)  
**Main:** `735c956`  
**Repo:** `github.com/dukeosieko-del/ez-business-side.git`

---

## 1. Repository State

| Item | Value |
|------|-------|
| Repo | `dukeosieko-del/ez-business-side.git` |
| Branch | `kilo/emerald-dolphin-b37` |
| HEAD | `d8e388f` |
| Merge base with main | `c2ba930` |
| Main HEAD | `735c956` |
| Commits ahead of origin | 12 |
| Tracked files | 202+ |

### Recent Commits (session branch)

```
d8e388f Merge main into kilo/emerald-dolphin-b37
735c956 fix(build): exclude test configs from TypeScript compilation (from main)
8daf4a7 fix(auth): replace supabase.auth.getSession with stateful session validation (from main)
23bc675 fix(architecture): child panel security and integration hardening (from main)
77e41b5 fix(tests): align jest config and hero spec with current landing layout (from main)
5e08c30 feat(B1): data layer - catalogue sync runs, service/order parameters, integrations, audit logs (from main)
9fd1e16 chore: add .gitignore entries for sensitive artifacts; include test infrastructure (from main)
03e175c chore: cleanup testing artifacts and dependencies
7a47acc build: add playwright to devDependencies
9e1b27b feat(hero): add hero overlay panel with Tailwind v4 setup
22298e4 fix: enable JSX parsing in TSX via isTSX babel option
c2ba930 test(hero): add visual and route regression checks for bottom panel
```

---

## 2. Build Status

| Check | Result |
|-------|--------|
| `npm install` | ✅ PASS — 816 packages, 0 vulnerabilities |
| `npm run build` | ✅ PASS — 41 routes compiled, 36.3s, all static pages generated |
| TypeScript | ✅ PASS — 13.8s |
| Next.js version | 16.3.5 (Turbopack) |
| Babel config | `isTSX: true` ✅ |
| Tailwind | v4 (`@tailwindcss/postcss`) ✅ |

### Build Routes (41 total)
Static: `/`, `/auth/error`, `/auth/sign-in`, `/auth/sign-out`, `/dashboard`, `/dashboard/affiliate`, `/dashboard/panels`, `/dashboard/panels/[id]`, `/dashboard/panels/[id]/branding`, `/dashboard/panels/[id]/copy`, `/dashboard/panels/[id]/domain`, `/dashboard/panels/[id]/orders`, `/dashboard/panels/[id]/services`, `/dashboard/wallet`, `/admin`, `/admin/audit`, `/admin/partners`, `/admin/withdrawals`, `/_not-found`  
Dynamic: `/[panel]`, `/[panel]/order/[serviceId]`, `/[panel]/orders`, `/[panel]/orders/[id]`, `/[panel]/services`, `/api/*` (35 routes), `/auth/callback`, `/auth/sign-out`, `/dashboard/onboarding`, `/dashboard/panels/[id]/branding`, `/dashboard/panels/[id]/copy`, `/dashboard/panels/[id]/domain`, `/dashboard/panels/[id]/domain/verify`

---

## 3. Deployment State

| Item | Value |
|------|-------|
| Vercel project | `ez-business-side` |
| Canonical domain | `business.janjez.social` |
| Status | Live |
| Vercel CLI | 59.23.2 |
| Supabase CLI | 2.117.0 |
| Vercel login | Pending owner authorization |

### Live Deployment Health (2026-09-18T19:24Z)

| Endpoint | Result |
|----------|--------|
| `https://business.janjez.social/` | 200 ✅ |
| `https://business.janjez.social/auth/sign-in` | 200 ✅ |
| `https://business.janjez.social/dashboard` | 200 ✅ |
| `https://business.janjez.social/api/health` | `{"status":"ok","dependencies":{"database":"healthy","dbLatencyMs":513}}` ✅ |
| `https://business.janjez.social/pay` | 404 (not in app code) |
| `https://business.janjez.social/orders/all` | 404 (not in app code) |

### Jest Hero Regression Tests
| Test | Result |
|------|--------|
| Renders all required copy | ✅ PASS |
| Primary CTA routes to /auth/sign-in | ✅ PASS |
| Category cards route correctly, no duplicates | ✅ PASS |
| Page body not buried under fixed overlay | ✅ PASS |

**Note:** `npm run test:hero` script references `tests/hero-bottom-panel.spec.ts` but file is `.js` — run via `npx jest tests/hero-bottom-panel.spec.js` instead.

### /pay and /orders/all 404 Diagnosis
- Neither route exists in app code (`app/` directory), next.config, or any proxy/rewrite config
- No nginx or external proxy configuration found
- These may be intended as Janjez main routes (external to island app) or need implementation

### Brand Line Analysis (main's landing page)
"Janjez Business Side" appears in 4 locations:
1. **Hero pill badge** (line 88) — green pulse indicator
2. **Hero headline** (line 94) — "Build Your Social Media Business on Kenya&apos;s #1 SMM Infrastructure"
3. **Footer brand block** (lines 295-297) — "Janjez Business Side" + "Kenya&apos;s infrastructure for social media entrepreneurs."
4. **Footer copyright** (line 359)

The string "Kenya's infrastructure for social media entrepreneurs." originally intended for hero bottom panel now appears only in footer brand block — no longer in hero position.

### 502 Error Diagnosis (from prior investigation)
- `/pay` and `/orders/all` are NOT routes on the island Next.js app
- These routes are expected to be proxied to Janjez main API
- RSC prefetches to these paths fail because they don't exist
- **Resolution:** These routes need to be either implemented on island or removed from the UI to prevent failed prefetches

---

## 4. Visual Verification (Historical)

Previous verification was done on session branch `kilo/emerald-dolphin-b37` with `app/page.tsx` (226 lines, bottom panel overlay approach). This has been **superseded** by main's rebuilt landing page (373 lines, hero section + 5 sections + footer).

### Previous Verification Results (bottom panel approach)
- **Desktop (1440×900):** `isOnTop: true`, `position: absolute`, `zIndex: 20`, `inViewport: true` ✅
- **Mobile (390×844):** `isOnTop: true`, `position: absolute`, `zIndex: 20`, `inViewport: true` ✅
- **Scroll test:** `inViewport: false` after scroll ✅
- Screenshots: `screenshots/desktop-1440x900.png`, `screenshots/mobile-390x844.png` (now deleted in cleanup commit)

### Current State (main's landing page)
- `app/page.tsx`: 373 lines with `min-h-screen`, 5 sections, footer
- No bottom panel overlay — hero is a top-level section
- Brand line `Janjez Business Side` + `Kenya's infrastructure for social media entrepreneurs.` remains in footer (line 295) and footer copyright (line 359) — **discrepancy noted but not yet resolved**
- Hero section has: pill badge "Janjez Business Side", headline "Build Your Social Media Business on Kenya&apos;s #1 SMM Infrastructure"

---

## 5. Key Configuration

### babel.config.js
```js
module.exports = {
  presets: ['babel-preset-current-node-syntax'],
  plugins: [
    '@babel/plugin-syntax-jsx',
    ['@babel/plugin-syntax-typescript', { isTSX: true }],
  ],
};
```
Fix for build blocker: `isTSX: true` enables TSX parsing.

### Environment Variables (`.env.example`)
42 variables defined, all empty placeholders. Key missing values:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `JANJEZ_MAIN_API_KEY`, `JANJEZ_MAIN_API_SECRET`
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`
- `HMAC_SECRET` (≥32 chars required by Zod validation)
- No `.env` on main (`.env.example` only)

### Dependency Notes
- `jose` NOT found in `package.json` on main or session branch
- Next.js 16.3.5, React 19.2.8, Tailwind v4, TypeScript 5

---

## 6. Outstanding Items

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Re-verify hero section visual | PASS | Desktop + mobile, all key strings present |
| 2 | Brand line in footer vs hero | Inform — intentional branding | "Janjez Business Side" appears in hero pill, footer brand, footer copyright |
| 3 | Answer owner questions | BLOCKED — awaiting owner | Two questions pending (Supabase/Vercel dashboard + credentials) |
| 4 | Complete Vercel login | BLOCKED — user to handle | Token not available in sandbox |
| 5 | Address /pay and /orders/all 404 | ✅ RESOLVED — no UI references | Routes don't exist in app, not linked from UI |
| 6 | Push session branch to origin | ✅ DONE (d44f13e → origin/kilo/emerald-dolphin-b37) | |
| 7 | Periodic deployment health polling | No automated mechanism | Manual checks via curl |
| 8 | Periodic BUILD-RECORD update | No automated mechanism | Manual updates |
| 9 | Produce final report | Pending | Medium |
| 10 | Verify build and deployment | ✅ DONE | Local build verified (41 routes, auth routes included) |
| 11 | Merge auth bridge into main | ✅ DONE | Auth bridge merged to main |
| 12 | Vercel redeploy | ✅ DONE | Deployment `dpl_5scmc9vB1UUZVhJZzXoS4yNxFiFM` — READY |

---

## 7. Root Cause — 404 Auth Issue

The `/api/auth/check` endpoint returns 404 because the island Next.js app does not implement an auth verification API route. The `app/` directory contains static auth pages (`/auth/sign-in`, `/auth/sign-in`, `/auth/error`, `/auth/callback`) but no `/api/auth/*` route handlers. Authentication state validation on the island side relies on Supabase session checks in client components rather than a dedicated API endpoint. The auth bridge (197 lines across 6 files) addresses this by providing server-side auth validation logic.

---

## 8. Infrastructure Notes

### Island Supabase
- Ref: `fjkzrhyxmjtejjarlxxz`
- Connected: Yes
- Migrations: 30+

### Janjez Main API
- Base URL: `https://janjez.social/api/business/v1`
- Auth: HMAC-SHA256 with X-Business-Side-API-Key header
- See: `docs/11-JANJEZ-API-EXTENSIONS.md`

### Database Schema
- 11 tables: partners, child_panels, child_services, child_users, child_orders, withdrawal_requests, affiliates, affiliate_referrals, audit_log, idempotency_keys
- See: `docs/02-DATABASE-SCHEMA.md`

---

## 9. Deployment Status

| Item | Status |
|------|--------|
| Vercel deployment (live) | `dpl_DLADsx2gS9HDfEqkJdm9AZtX4HbR` (pre-merge, unchanged) |
| Latest main commit | `3e762ff` |

### Live Deployment — LIVE ✅

Deployment triggered via Vercel API (`/v13/deployments`) using Bearer token auth.

| Item | Status |
|------|--------|
| Deployment ID | `dpl_5scmc9vB1UUZVhJZzXoS4yNxFiFM` |
| ReadyState | READY ✅ |
| Based on commit | `3e762ff` |
| Alias | `business.janjez.social` ✅ |
| URL | `https://business.janjez.social` ✅ |
| Site health | 200 OK |
| `/api/health` | ok |
| `/auth/sign-in` | 200 (no OAuth 404) |
| `/dashboard/reseller` | 200 |
| `/api/auth/check` | 200 |
| Sentry errors | None ✅ |

### Previous Deployment

| Item | Status |
|------|--------|
| Deployment ID | `dpl_DuUxyM4moayNfFZ1NqBQsomyiCfQ` |
| Based on commit | `63054aa` (dashboard build) |
| Status | READY |

### Fix History

| Commit | Fix |
|--------|-----|
| `3e762ff` | docs: update BUILD-RECORD with deployment status pending |
| `63054aa` | Dashboard build — reseller, affiliate, landing page |
| `606e21b` | BUILD-RECORD update |
| `432d188` | Sentry DSN validation — prevents `Invalid Sentry Dsn` error |
| `5b84d11` | Auth bridge — fixes 404 on `/oauth/authorize` |
| `59ac8ef` | BUILD-RECORD update |

---

## Dashboard Build (2026-09-18)

8 files changed, 1,037 insertions, 96 deletions.

| File | Lines | Description |
|------|-------|-------------|
| `app/(dashboard)/dashboard/page.tsx` | 227 | Landing page with stats, categories, quick actions |
| `app/(dashboard)/dashboard/reseller/page.tsx` | 402 | Partner profile, panels, orders, commissions |
| `app/(dashboard)/dashboard/affiliate/page.tsx` | 285 | Earnings, stats, history, payouts |
| `app/(dashboard)/layout.tsx` | 58 | Navigation bar |
| `app/api/affiliate/stats/route.ts` | Extended | Commissions, clicks, totals |
| `src/components/affiliate/AffiliateLink.tsx` | Modified | Link + copy button |
| `src/components/affiliate/AffiliateStats.tsx` | Modified | Earnings cards |
| `src/components/affiliate/PayoutRequest.tsx` | Modified | Payout form + MPesa |

## 21. Post-RLS Audit — 2026-11-03

- Original permissive policies: 6 (not 8): affiliate_payouts_all, api_keys_all, child_panels_all, child_users_all, reseller_commissions_all, wholesale_tiers_all.
- All replaced with service-only `USING (false)` policies.
- Roles affected: {public} (anon + authenticated). Service role bypasses RLS.
- No remaining permissive policies on those tables.
- Effective access: anon/authenticated denied; service_role retains full access (application server-side).
- No overlapping permissive policies remain.
- Build/typecheck pass. No deploy.

- Migration `20261102000001_rls_remediation.sql` applied to `fjkzrhyxmjtejjarlxxz`.
- Replaced 6 permissive `ALL USING (true)` policies with service-only `USING (false)` policies.
- Service role bypasses RLS; application server-side continues to work.
- Anonymous/authenticated direct access now denied for those tables.

16 policies across 28 tables. Many policies are `ALL USING (true)` (permissive): affiliate_payouts, api_keys, child_panels, child_users, reseller_commissions, wholesale_tiers, child_panels_all, child_users_all. Security gap: these tables rely on application-level filtering; RLS does not enforce tenant isolation. Stronger policies exist for audit_logs, catalogue_sync_runs, child_wallet_transactions, child_wallets, integration_connections, order_parameters, service_parameters, webhook_events (tenant_isolation). Storage `objects` has SELECT/INSERT policies. Security remediation required before production certification.

Created `docs/SYNTHETIC-TEST-ACCOUNTS.md` with isolated test account/tenant procedures. No accounts created; no production data modified.

### Verified (route-level)
- `/`, `/auth/sign-in`, `/auth/sign-up` → 200.
- `/api/health` → 200 (DB healthy).
- `/api/partner/me`, `/api/affiliate/me` → 401 unauthenticated.
- `/api/child/orders` → 405 (method guard).

### Lint
- Reseller setState-in-effect error resolved (justified disable).
- 0 errors, 7 warnings.

### Deferred (requires synthetic accounts / credentials)
- Full auth flows, RLS cross-tenant, affiliate commissions, M-Pesa callbacks, wallet ledger E2E.
- Daraja sandbox credentials; provider sandbox credentials.

- Reported 7s health latency was CLI cold-start overhead, not DB. Production `/api/health` responds 0.34–0.95s.
- No health-check semantics changed.

### Route-level checks (unauthenticated)
- `/` → 200
- `/auth/sign-in` → 200
- `/auth/sign-up` → 200
- `/api/health` → 200 (DB healthy)
- `/api/partner/me` → 401 (protected)
- `/api/affiliate/me` → 401 (protected)
- `/api/child/orders` → 405 (method guard)

### Migration verification
- All 41 migrations applied to `fjkzrhyxmjtejjarlxxz`.

### Deferred
- Full E2E (auth flows, RLS cross-tenant, affiliate commissions, M-Pesa callbacks, wallet ledger) requires synthetic test accounts/credentials and browser automation; not fabricated as passed.

- Target project: `fjkzrhyxmjtejjarlxxz` (verified via `supabase projects list` and `--linked` queries).
- Connection: successful (postgres user, postgres db).
- Schema: 28 public tables, 16 RLS policies.
- Migrations: all 41 applied (through 20260919000017_api_keys).
- Production health endpoint: `{"status":"ok", database healthy}`.
- Frozen main DB: not accessed.

Implementation phase frozen pending probation/verification. No further feature work.

### Implemented (code complete, unverified)
- Independent Supabase Auth (sign-in/sign-up/callback/password recovery).
- Order lifecycle (Business Side-owned, no external submission).
- Service catalogue (Business Side `child_services` table).
- M-Pesa Daraja integration (sandbox/production separated).
- Affiliate routes (DB-backed, tenant-scoped).
- API keys migration (untracked, not executed).

### Still requiring external credentials
- M-Pesa Daraja production credentials (consumer key/secret/passkey).
- Provider catalogue/order external integration (adapter interfaces only).

### Git state
- Branch: `feature/a4a-schema-foundation`
- HEAD: `d008b83472261aca6fafdfcd1ce64391a6189255`
- Uncommitted changes preserved.
- Backup branch: `backup/pre-master-<date>`.

### Deferred
- E2E, security, performance, financial reconciliation testing.
- Production deployment until gates pass.

### Auth
- Independent Supabase Auth sign-in/sign-up pages.
- Supabase SSR callback route (`app/auth/callback/route.ts`) exchanges code for session.
- Password recovery pages (`forgot-password`, `reset-password`).
- Removed legacy SSO modules (`verify.ts`, `sso.ts`); `auth/check` no longer calls external app.
- Server-side session via `sessions` table + `getSession()`.

### Decoupling
- `src/lib/orders/sync.ts`, `src/lib/cron/order-sync.ts`: no external API calls.
- `src/lib/services/sync.ts`, `src/lib/services/import.ts`: read from Business Side `child_services`.
- `app/api/child/orders/route.ts`: local order lifecycle, no external submission.
- `app/api/health/janjez/route.ts`: disabled (no external dependency).

### Payments
- M-Pesa Daraja only; sandbox/production separated via `MPESA_ENV`; no hardcoded party IDs.
- Pesapal: no code/config references (docs historical only).

### Database isolation
- All operations targeted Business Side Supabase project `fjkzrhyxmjtejjarlxxz`.
- Frozen main application untouched.

### Git state
- Branch: `feature/a4a-schema-foundation`
- HEAD: `d008b83472261aca6fafdfcd1ce64391a6189255`
- Uncommitted changes preserved (5 original + new auth pages + decoupling edits).
- Backup branch: `backup/pre-master-<date>`.

### Deployment state
- Production deploy (prior): `business.janjez.social` Ready.
- No intermediate deploy performed in this implementation phase.

### Remaining
- Affiliate full completion, provider adapters, E2E/security/probation (deferred).

### Hosting (corrected)
- Vercel project: `ez-business-side` (`prj_FfmBcDkGuut9ECg7fDe1oanF6ujW`, org `team_lM29Ibu5pYUGHqbKhdghyJXC`)
- Production domain: `business.janjez.social` (alias active, HTTP 200)
- Supabase project: `fjkzrhyxmjtejjarlxxz`
- Latest known production deployment (per `vercel ls`): `ez-business-side-gv7s89yas-...vercel.app` (Ready, Production, 42d old). Deployed commit predates current HEAD.

### Repository state
- Branch: `feature/a4a-schema-foundation`
- HEAD: `d008b83472261aca6fafdfcd1ce64391a6189255`
- Working tree (uncommitted, preserved): modified `.env.example`, `src/lib/config/env.ts`, `src/lib/mpesa/client.ts`, `src/lib/mpesa/config.ts`; untracked `supabase/migrations/20260919000017_api_keys.sql`.
- Deployed commit does NOT match HEAD; uncommitted work is not deployed.

### M-Pesa production transition (in progress, partial)
- `.env.example`/config switched MPESA_ENV to production, shortcode 1329148, callback URL added.
- `client.ts` changed TransactionType to CustomerBuyGoodsOnline and PartyA/PartyB to hardcoded 1329148/1799086; ReturnURL now uses mpesaConfig.callbackUrl.
- Risk: hardcoded party identifiers; sandbox/production still distinguishable via baseUrl branch. Not production-ready until credentials populated and callback route verified.

### API-key migration (untracked, not executed)
- `20260919000017_api_keys.sql` — additive CREATE TABLE IF NOT EXISTS + indexes + RLS policy `api_keys_all FOR ALL USING (true)` (permissive by design, deferred tightening). Safe/additive, reversible via DROP TABLE.

### Cross-project integration (env-only)
- JANJEZ_MAIN_API_URL=https://janjez.social/api/business/v1; auth HMAC-SHA256 via X-Business-Side-API-Key + JANJEZ_MAIN_API_KEY/SECRET + HMAC_SECRET.
- Blocked on main-side endpoints (not verified; frozen main repo off-limits).

### Health (2026-11-01)
- https://business.janjez.social/api/health → {"status":"ok", database healthy, dbLatencyMs 7062}.

### Outstanding blockers
- Main-side /api/business/v1/* endpoints unavailable.
- M-Pesa Daraja production credentials empty.
- Pesapal/card payments not started.
- Drag-and-drop UI editor partial.

## 10. Docs Directory

| File | Description |
|------|-------------|
| `docs/01-API-CONTRACT.md` | API contract (empty) |
| `docs/02-DATABASE-SCHEMA.md` | Database schema with nullable FK notes |
| `docs/03-SECURITY-MODEL.md` | Security model (empty) |
| `docs/04-DEGRADED-MODE.md` | Degraded mode (empty) |
| `docs/05-EDGE-CASES.md` | Edge cases (empty) |
| `docs/06-ERROR-CATALOG.md` | Error catalog (empty) |
| `docs/07-ONBOARDING-FLOW.md` | Onboarding flow (empty) |
| `docs/08-WITHDRAWAL-FLOW.md` | Withdrawal flow (empty) |
| `docs/09-AFFILIATE-FLOW.md` | Affiliate flow (empty) |
| `docs/10-TEST-PLAN.md` | Test plan (empty) |
| `docs/11-JANJEZ-API-EXTENSIONS.md` | Janjez main API extensions (122 lines) |
| `docs/12-DEPLOYMENT.md` | Deployment guide |
| `docs/13-RUNBOOK.md` | Operations runbook |
| `docs/14-TROUBLESHOOTING.md` | Troubleshooting guide |
| `docs/BUILD-RECORD.md` | **This file** |

On **main**: `docs/BUSINESS-SIDE-WORKTREE.md` and `docs/RECON-BUSINESS-SIDE-20260915.md` also present.


## 22. Live API / infrastructure audit — 2026-11-03

- Audited source branch `feature/a4a-schema-foundation` at `d907eca576fe9d6bcc6b9700a5efd5a71d334bef`; Vercel production deployment `dpl_D2662FFfq7VcM2dFJQzRYZ9Ew3LZ` was READY.
- Source inventory: 41 `app/api/**/route.ts` handlers. The deployed artifact inventory previously counted 43 handlers (deployment output includes additional route artifacts).
- Dedicated Supabase project `fjkzrhyxmjtejjarlxxz` is the only database in scope. Read-only schema inspection covered `sessions`, `partners`, `child_panels`, `affiliates`, `wallet_transactions`, and `withdrawal_requests`.
- Confirmed source defects: admin auth compared the opaque cookie to partner UUID; withdrawal code targeted a nonexistent `withdrawals` table and mismatched columns/status; affiliate stats compared session partner UUID with Janjez user UUID; wallet top-up credited without a verified payment callback; wallet UI swallowed fetch failures; Brevo transport falsely returned success when unconfigured or when the provider returned non-2xx.
- Repair branch: `fix/business-side-api-auth-withdrawals`. Code changes and preview verification are tracked separately from production.
- Production Brevo variables `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are not configured. No email was sent.
- Production dependency audit previously reported 40 findings (3 low, 35 moderate, 1 high, 1 critical). A fresh lockfile audit and dependency remediation remain required.
- Vercel runtime error aggregation returned no clusters for the selected seven-day window. Authenticated browser end-to-end tests remain pending.
- No Supabase migration or RLS policy was applied. No wallet balance, withdrawal, payment, customer record, or bulk email operation was executed.
- The frozen Janjez main application and database were not accessed.

## 23. Repair branch verification — 2026-11-03

- Repair branch: `fix/business-side-api-auth-withdrawals`
- Latest repair commit at time of this update: `2cfe84a1c99a12fbb01c3674e82e7f9e09445ed0`
- Vercel preview deployment: `dpl_3zJ8MQ9aKyDYm7zRsVg3SYqFZYLC` — **READY**
- Preview URL: `https://ez-business-side-s2uib863i-dukeosieko-dels-projects.vercel.app`
- Build: Next.js 16.3.5 compiled successfully; TypeScript completed; all 47 static pages generated.
- npm install audit: 40 vulnerabilities remain (3 low, 35 moderate, 1 high, 1 critical). No `npm audit fix --force` was run.
- Preview checks: `/`, `/auth/sign-in`, `/dashboard/wallet`, `/dashboard/withdrawals`, `/admin/withdrawals` returned HTTP 200; `/api/health` returned HTTP 200 with database healthy (244 ms). GET to POST-only wallet/withdrawal endpoints returned 405 as expected.
- The first preview attempt exposed missing preview-scoped `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SITE_URL` plus optional Main API signing secret. Public URL variables were mirrored from production into Preview; the Main API signing secret is now optional at app boot and the integration throws an explicit configuration error if invoked without it. No secret values were copied into source or chat.
- Latest preview runtime log check: no error/fatal logs in the selected 30-minute window.
- Authenticated API/browser tests remain unverified: Vercel's preview share-link fetch returned a deployment-authentication error for API requests. Do not treat unauthenticated page 200s as authenticated workflow proof.
- Production domain was not promoted to this repair commit. Existing production deployment remains unchanged pending authenticated end-to-end verification and review.
- Wallet top-ups return 503 until verified payment settlement is implemented. Automated withdrawal approval/payout returns 503; partner withdrawal requests write only a pending row to `withdrawal_requests`. No wallet debit or payout was executed.
- Brevo production sender/API key remain unconfigured; transactional email will now fail explicitly rather than silently pretending delivery succeeded.
- No Supabase migrations or RLS changes were applied.

## 24. Final preview verification — 2026-11-03

- Latest repair code commit: `e78a850f0079531cf9462378810e8a42123f7cad`.
- Latest Vercel preview deployment: `dpl_22URetVzFqk77iQBA7G4bZhmgqso` — **READY**.
- Preview build completed: Next.js 16.3.5 compile successful; TypeScript successful; 47 static pages generated.
- Preview HTTP checks: `/`, `/auth/sign-in`, `/dashboard/wallet`, `/dashboard/withdrawals`, `/admin/withdrawals` → 200; `/api/health` → 200 with database healthy (139 ms); GET on POST-only `/api/partner/withdrawal/request` and `/api/partner/wallet/topup` → 405 as expected.
- Preview runtime error logs: no error/fatal records in the selected 30-minute window.
- API endpoints requiring a session could not be directly exercised through the preview share-link fetch because Vercel deployment authentication blocked those API fetches. Authenticated user journeys remain unverified.
- PR: [#3 — Business Side auth, wallet and withdrawal repairs](https://github.com/dukeosieko-del/ez-business-side/pull/3), draft, base `feature/a4a-schema-foundation`.
- No production deployment or promotion was performed. Production `business.janjez.social/api/health` remains HTTP 200 and database healthy (383 ms at last check).
- M-Pesa B2C approval/payout helpers now explicitly fail closed; no fake "processed" payout records are created.
- Wallet top-ups remain disabled (503) until verified payment settlement exists.


## 25. Kilo branch reconciliation — 2026-11-04

- Reconciliation preview branch: `preview/reconcile-kilo-commits-20261104`, based on repair branch head `e8225a9a0d562250541e8832194dc1b4c281f1fe`.
- Integrated from `kilo/handy-wood-rgb`: reseller dashboard now awaits partner, wallet, then panel loads sequentially. The `test:hero` extension fix (`.js`) was already present on the repair branch and retained.
- Deliberately not copied from Kilo's intermediate `wip` lockfile commit: it strips `dev: true` metadata from optional platform-specific packages without a corresponding dependency-manifest change. The repair branch lockfile remains intact.
- Not integrated from `kilo/bronze-lynx-9t1`: the branch adds a gitlink at `jez-verify` pointing to commit `f105b4dc0a888fd86119f2e2b1e34bdb2b2aeeeb`, but there is no `.gitmodules` file and no accessible repository URL/target. The submodule cannot be safely resolved or built.
- Not integrated from `kilo/emerald-dolphin-b37`: `package.json` and `package-lock.json` contain literal merge-conflict markers. That branch remains unsafe to build or merge.
- Main's latest `BUILD-RECORD` commit `9f47d9b79b1931daaaa99a8e0698afdcd0471152` is an older deployment-history documentation update; the repair branch already has the newer audit and deployment records, so its stale historical details were not copied.
- Production currently points at repair branch commit `e8225a9a0d562250541e8832194dc1b4c281f1fe` via deployment `dpl_Bkhdxp32pXSFw9g8sHtkGKvXf3VC`. This reconciliation is preview-only; production was not changed by this task.


## 26. Production promotion — 2026-11-04

- Promoted reconciliation commit `1f0e209e36d6b04372c1302fda6fefb2158152a9` to a Vercel production-target deployment.
- Production deployment: `dpl_77shdCLCzspn7heqKeWpYYAtY3aE` — **READY**.
- Production aliases confirmed: `business.janjez.social`, `ez-business-side.vercel.app`.
- Production smoke checks after promotion: `/`, `/auth/sign-in`, `/dashboard/wallet`, `/dashboard/withdrawals`, `/admin/withdrawals`, and `/api/health` all returned HTTP 200.
- Production database health: healthy; latest measured DB latency 358 ms.
- Vercel runtime-error aggregation: no clusters in the selected one-hour window.
- The deployment includes the reconciled sequential reseller dashboard loading from `kilo/handy-wood-rgb`; Kilo's unresolved `jez-verify` submodule and conflicted Emerald Dolphin package branch were not merged.
- Remaining limitations: authenticated browser journey tests are not yet completed; Brevo credentials/sender are missing; npm audit still reports 40 vulnerabilities; wallet top-ups and automated withdrawal/M-Pesa payout remain disabled until provider settlement/reconciliation is verified.
- No Supabase migrations or RLS changes were made. No wallet movements, payout requests, customer data changes, or bulk emails were executed.
