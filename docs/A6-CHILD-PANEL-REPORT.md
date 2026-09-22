# A6 — Child Panel Programme: Evidence Report

**Date:** 2026-09-22
**Branch:** `feature/business-side-fork`
**Commits:** `10816d6` (A6a/A6b) · `6baf8ca` (A6c-h)
**Status:** COMPLETE — signed off

---

## 1. Sub-phase status

| Phase | Worktree commit | Status |
|-------|----------------|--------|
| A6a — `child_users.name` | `10816d6` | ✅ |
| A6b — Child panel tagging | `10816d6` | ✅ |
| A6c — `child_users` RLS | `6baf8ca` | ✅ |
| A6d — `child_panels` RLS | `6baf8ca` | ✅ |
| A6e — `applyMarkup` alignment | `6baf8ca` | ✅ |
| A6f — `payment_method` CHECK | `6baf8ca` | ✅ |
| A6g — Admin surface | `6baf8ca` | ✅ |
| A6h — Analytics | `6baf8ca` | ✅ |

## 2. Gaps closed

| # | Gap | Fix | Verified |
|---|-----|-----|----------|
| A6-1 | `child_users.name` missing — signup 500s | Migration `20260919000011` | Signup with name succeeds |
| A6-2 | `signup_source='child-panel'` never assigned | Migration `20260919000013` + `provision.ts` | Panel row shows `child-panel` |
| A6-3 | `child_users` RLS enabled but no policy | Migration `20260919000014` | Policy `child_users_all` present |
| A6-4 | `child_panels` RLS enabled but no policy | Migration `20260919000015` | Policy `child_panels_all` present |
| A6-5 | `applyMarkup` hardcoded 2× (200%) | `import.ts` now uses A5 wholesale + 50% default | Within A5c 100% cap |
| A6-7 | `payment_method` unconstrained | Migration `20260919000016` CHECK | `crypto` rejected, `mpesa` accepted |

## 3. Additional defects found and fixed

| Defect | Impact | Fix |
|--------|--------|-----|
| `provision.ts:73` returned a fabricated `name` field | Silent data lie — panel name never persisted | Migration `20260919000012` + route now inserts + selects it |

## 4. A6f — payment_method values

Probed the codebase: `grep -rn "payment_method" src app` returned zero hits, so the
values are inferred from the payment gateway model (`payment_gateways: ['mpesa']`)
and the child wallet debit path. Allowed set: `mpesa`, `wallet`, `manual`.

## 5. Verification evidence

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Exit 0, zero errors |
| `next build` | ✅ Compiles successfully |
| 37 migrations seeded | ✅ Clean |
| A6a signup with name | ✅ Succeeds, name persisted |
| A6b panel tag | ✅ `signup_source = child-panel` |
| A6c/d RLS policies | ✅ Present on both tables |
| A6f valid payment_method | ✅ `mpesa` accepted |
| A6f invalid payment_method | ❌ `crypto` rejected by CHECK |
| A6h analytics | ✅ Counts correct for seeded panel |
| Live island DB | Untouched (all 16 new migrations unapplied) |
| Production checkout | Untouched |
| Both worktrees clean | ✅ |
| No pushes | ✅ |

## 6. A6f route deferral

`/api/business/v1/users` and `/api/business/v1/categories` are documented but do not
exist on the main build. Client helpers are wired; server routes are an A7 handoff.