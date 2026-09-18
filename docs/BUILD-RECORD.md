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

### Health Checks (as of 2026-09-18T19:13Z)

| Endpoint | Result |
|----------|--------|
| `https://business.janjez.social/` | 200 ✅ |
| `https://business.janjez.social/api/health` | `{"status":"ok","dependencies":{"database":"healthy","dbLatencyMs":559}}` ✅ |
| `https://business.janjez.social/pay` | 404 (not on island) |
| `https://business.janjez.social/orders/all` | 404 (not on island) |

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

| # | Item | Status | Priority |
|---|------|--------|----------|
| 1 | Re-verify hero panel visual on current (main's) landing page | Pending | High |
| 2 | Resolve brand line in footer vs hero overlay discrepancy | Pending | Medium |
| 3 | Answer owner questions re: Supabase/Vercel dashboard connection | Pending | Medium |
| 4 | Complete Vercel login (code WZBX-LJCG) for API access | Pending | Medium |
| 5 | Address `/pay` and `/orders/all` 404 routes | Pending | Medium |
| 6 | Push session branch to origin | Pending | Medium |
| 7 | Periodic deployment health polling (15 min interval) | Active | Medium |
| 8 | Periodic BUILD-RECORD update (30 min interval) | Active | Medium |
| 9 | Produce final report | Pending | Medium |

---

## 7. Infrastructure Notes

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

## 8. Docs Directory

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
