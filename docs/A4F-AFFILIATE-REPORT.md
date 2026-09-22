# A4f — Affiliate Programme: Full Evidence Report

**Date:** 2026-09-22
**Branch:** `feature/business-side-fork`
**Commits:** `c9a2f3b` (A4a) · `95b12c5` (A4b) · `aaf2777` (A2 fix) · `b35048e` (A4c)
**Status:** COMPLETE — awaiting owner gates

---

## 1. Scope

Affiliate programme for Business Side: click tracking, commission accrual with
hold period, clawback on refund, payout requests with admin approval, and
scheduled background jobs.

## 2. Sub-phase status

| Phase | Commit | Status |
|-------|--------|--------|
| A4a — Schema foundation | `c9a2f3b` | ✅ Signed off |
| A4b — Commission pipeline | `95b12c5` | ✅ Signed off |
| A2 TS fix (JanjezUser) | `aaf2777` | ✅ Signed off |
| A4c — Payout pipeline | `b35048e` | ✅ Signed off |
| A4d — Cron schedulers | (in A4b) | ✅ Complete |
| A4e — Attribution fix | (in A4b) | ✅ Complete |
| A4f — This report | — | ✅ |

## 3. Gaps closed

| # | Gap | Fix | Verified |
|---|-----|-----|----------|
| 1 | `affiliate_payouts` missing | Migration `20260919000001` | Sandbox insert |
| 2 | `child_orders.external_order_id` missing | Migration `20260919000002` | Sandbox insert |
| 5 | `/api/affiliate/convert` orphaned | Wired into order-status webhook | Sandbox lifecycle |
| 6 | Aggregates never recomputed | `refreshAffiliateAggregates()` | Sandbox lifecycle |
| 7 | `affiliate_referrals` never written | `recordAffiliateReferral()` in `trackClick()` | Sandbox |
| 8 | Cron jobs unscheduled | `app/api/cron/run/route.ts` + Vercel crons | Runtime auth test |
| 9 | Payout discarded MPesa number | `mpesa_number` persisted in `createPayout()` | Sandbox |
| 10 | No admin approval surface | `PayoutQueue` + approve/reject routes | Build passes |
| 11 | Fingerprint-only attribution | `ref_code` filter in `findClickByFingerprint()` | Code review |

### Additional defects found and fixed

- `child_wallet_credit` / `child_wallet_debit` omitted NOT NULL `tenant_id`
  (wallets *and* ledger) — migration `20260919000003`
- `partners.is_admin` missing — every admin route returned 401 — migration
  `20260919000004`
- `partners.onboarding_state` / `signup_source` missing — auth sync 500s —
  migration `20260919000005`
- `debit_wallet` called with 4 args, real signature needs 5 (`p_metadata`) —
  `src/lib/withdrawal/approve.ts`
- `src/lib/supabase/server.ts` exported `createClient`, but 20 modules import
  `getSupabaseAdmin` — restored correct API from island source
- `JanjezUser` interface lacked `signup_source` — `src/lib/auth/verify.ts`

## 4. Verification evidence

| Check | Result |
|-------|--------|
| `tsc --noEmit` | **Exit 0, zero errors** |
| `next build` | **Compiled successfully** (18.5s) |
| Cron auth (runtime) | No header → 401 · wrong bearer → 401 · correct bearer → 200 |
| Sandbox lifecycle | Conversion → aggregates → hold release → clawback → all pass |
| Sandbox payout lifecycle | Request → approve → paid → reject → all pass |
| Live island DB | **Untouched** (all 5 migrations unapplied) |
| Push to remote | **None** |

## 5. Owner gates pending

| Gate | Trigger | Blocking |
|------|---------|----------|
| Apply 5 migrations to live island DB | A4f signed off | Affiliate schema live |
| A2 migration to production | A2 end-to-end verified | Auth tagging in production |
| Key alignment (`INVALID_API_KEY`) | Owner decision | Business-side full integration |
| Vercel deploy | A4f signed off | Affiliate programme live |

## 6. Sequencing note

A4e (attribution fix) and A4d (cron schedulers) were pulled forward into A4b
rather than executed as separate sub-phases. The deliverables are identical;
only the ordering differs. This is reported accurately per governance requirement.