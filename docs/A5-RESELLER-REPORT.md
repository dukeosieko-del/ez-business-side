# A5 — Reseller Programme: Evidence Report

**Date:** 2026-09-22
**Branch:** `feature/business-side-fork`
**Commits:** `c7f7442` (A5a/A5b/A5d/A5e/A5f) · `5d7784a` (A5c)
**Status:** COMPLETE — signed off

---

## 1. Sub-phase status

| Phase | Worktree commit | Status |
|-------|----------------|--------|
| A5a — Wholesale tiers | `c7f7442` | ✅ |
| A5b — Reseller tagging | `c7f7442` | ✅ |
| A5c — Markup enforcement | `5d7784a` | ✅ |
| A5d — Reseller onboarding | `c7f7442` | ✅ |
| A5e — Reseller commissions | `c7f7442` | ✅ |
| A5f — Missing endpoints | `c7f7442` | ⏸️ Deferred to A7 |

## 2. Gaps closed

| # | Gap | Fix | Verified |
|---|-----|-----|----------|
| A5-1 | No wholesale price tiers | `wholesale_tiers` table + 4 seed tiers + `getWholesalePrice()` | Wholesale 80 < retail 100 |
| A5-2 | `signup_source='reseller'` never assigned | `VALID_SIGNUP_SOURCES` whitelist in `auth/sync/route.ts` | Sandbox: `signup_source = reseller` |
| A5-4 | Markup not enforced | 100% cap server-side in `child/orders/route.ts` | 150% rejected, 100% accepted |
| A5-5 | No reseller onboarding checklist | `reseller_agreement_accepted` + `branding_completed` flags | Incomplete flags block activation |
| A5-6 | Commissions not persisted | `reseller_commissions` table + `refreshResellerTotals()` | Commission 350000 recorded |

## 3. Additional defects found and fixed

| Defect | Impact | Fix |
|--------|--------|-----|
| `child/orders/route.ts:52` selected `service.cost` but column didn't exist | Every child order submission 500s | Migration `20260919000010` |
| Migration `20260919000007` SQL comment with bare `--` | Seed run failed | Fixed |
| `PriceEditor.tsx` allowed markup up to 200% | UI bypassed the 100% cap | Clamped to [0, 100] |

## 4. A5f — deferred to A7

`/api/business/v1/users` and `/api/business/v1/categories` are documented in
`docs/11-JANJEZ-API-EXTENSIONS.md` but **do not exist on the main build**
(`/home/ubuntu/janjez-socio/src/app/api/business/v1/`). Adding them requires
production modification — gated like A3.

**Status:** Client-side helpers (`janjezApi.getUsers()`, `getCategories()`) are
wired and ready in `src/lib/jannez-api/client.ts`. Server-side routes are an A7
handoff item.

## 5. Verification evidence

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Exit 0, zero errors |
| `next build` | ✅ Compiles successfully |
| A5a wholesale math | 5000 units → 80/unit (20% Enterprise tier) |
| A5b reseller tag | `signup_source = reseller` |
| A5c markup 100% | Accepted (cost 1000, markup 1000) |
| A5c markup 150% | Rejected — "exceeds 100% cap" |
| A5c negative markup | Rejected — "cannot be negative" |
| A5e commission | total_commission 350000, pending 0 |
| A5d onboarding | Incomplete flags set to false |
| Live island DB | Untouched (all 10 migrations unapplied) |
| Production checkout | Untouched |
| Both worktrees clean | ✅ |
| No pushes | ✅ |

## 6. Owner gates pending

| Gate | Blocking |
|------|----------|
| Apply 10 migrations to live island DB | Affiliate + reseller schema live |
| A2 migration to production | Auth tagging live |
| Key alignment (`INVALID_API_KEY`) | Full integration |
| A5f routes on main build | A7 (production modification) |
| Vercel deploy | Programme live |