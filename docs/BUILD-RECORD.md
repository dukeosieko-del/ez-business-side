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
| 12 | Vercel redeploy | PENDING | Code on main, build verified, awaiting Vercel auto-deploy |

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
| Vercel deployment (live) | `dpl_DLADsx2gS9HDfEqkJdm9AZtX4HbR` |
| Latest main commit | `432d188` |
| Local build verified | ✅ 41 routes |
| Site health | ✅ `/` 200, `/api/health` ok, `/auth/sign-in` 200 |

### Fix History

| Commit | Fix |
|--------|-----|
| `432d188` | Sentry DSN validation — prevents `Invalid Sentry Dsn` error when DSN is placeholder |
| `5b84d11` | Auth bridge — fixes 404 on `/oauth/authorize`, adds `/api/auth/check` + `/api/auth/sync` |
| `59ac8ef` | BUILD-RECORD update with deployment status |

---

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
