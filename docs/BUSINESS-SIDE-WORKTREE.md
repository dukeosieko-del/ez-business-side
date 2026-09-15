# Janjez Business Side — Worktree

**Created:** 2026-09-15
**Owner:** Project Owner
**Original vision:** Captured verbatim below
**Architecture:** Captured verbatim below
**Status:** Living document — updated as work progresses

---

## Section 1 — Original Vision (Verbatim from Owner)

> [INSERT OWNER'S ORIGINAL PROMPT VERBATIM — to be pasted from the Owner's initial directive. Contact Project Director if unavailable.]

---

## Section 2 — Agreed Architectural Proposal (Verbatim from 2026-09-11)

> [INSERT ARCHITECTURAL PROPOSAL VERBATIM — all 9 parts, all tables, all diagrams. Contact Project Director if unavailable.]

---

## Section 3 — Build Worktree (Checklist)

### Phase 1 — Foundation
- [x] Create separate island repository `ez-business-side`
- [x] Set up Next.js 16 + TypeScript + Tailwind v4
- [x] Implement SSO callback skeleton
- [ ] **BLOCKED:** Janjez main `/oauth/authorize` endpoint does not exist yet
- [x] Build user registration/linking flow scaffolding
- [x] Set up Vercel deployment
- [x] Configure domain `business.janjez.social`

### Phase 2 — Janjez Main API Extensions
- [ ] Build `/api/business/v1/*` endpoints on Janjez main
- [ ] Add partner authentication middleware (HMAC)
- [ ] Extend wallet for partner top-up
- [ ] Extend order creation for partner-initiated orders
- [ ] Add partner management to Janjez admin
- [ ] Rate limiting and security hardening

### Phase 3 — Partner Onboarding
- [x] Partner registration flow
- [x] Demo panel generation
- [x] Service catalogue import UI (integration with main pending)
- [x] Price adjustment interface
- [x] M-Pesa STK push for KES 1,499 activation (stub — real creds pending)
- [x] Panel status management

### Phase 4 — Child Panel Core
- [x] Subdomain provisioning
- [x] Custom domain linking
- [x] Child panel rendering engine
- [x] Child user registration/login
- [x] Child order placement
- [ ] Order forwarding to Janjez — BLOCKED: main API pending

### Phase 5 — UI Editor
- [x] Color scheme editor
- [x] Copywriting editor
- [ ] Drag-and-drop layout editor — PARTIAL
- [ ] Template presets
- [x] Live preview
- [ ] Save/publish workflow — PARTIAL

### Phase 6 — Payments & Wallets
- [x] M-Pesa integration (sandbox creds)
- [ ] Pesapal integration — NOT STARTED
- [ ] Card payment integration — NOT STARTED
- [x] Child wallet system
- [x] Partner wallet system
- [x] Withdrawal request flow
- [ ] Admin approval UI in Janjez main — NOT STARTED
- [x] 5% fee calculation
- [x] KES 500 minimum enforcement

### Phase 7 — Affiliate System
- [x] Affiliate registration
- [x] Affiliate link generation
- [x] Click tracking
- [x] Conversion tracking
- [x] Commission calculation (10%)
- [x] Affiliate dashboard (earned/pending/completed)
- [x] M-Pesa payout workflow

### Phase 8 — Testing & Launch
- [ ] End-to-end testing
- [ ] Security penetration testing
- [ ] Load testing
- [x] Documentation (in progress)
- [ ] Beta launch
- [x] Monitoring setup (Sentry DSN wired)

---

## Section 4 — Current Blockers

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | Janjez main `/oauth/authorize` endpoint missing | SSO login fails with 404 | Build on main side |
| 2 | Janjez main `/api/business/v1/*` endpoints missing | Service import, fulfillment, affiliate conversion blocked | Build on main side |
| 3 | Island M-Pesa Daraja credentials are sandbox placeholders | KES 1,499 activation cannot complete real payment | Owner obtains Daraja credentials |
| 4 | Pesapal integration not started | Alternative payment gateway unavailable | Build (Phase 6) |
| 5 | Card payment integration not started | Card payments unavailable | Build (Phase 6) |
| 6 | Full drag-and-drop UI editor is partial | Partners cannot fully customize layout | Build (Phase 5) |
| 7 | Landing page final layout in progress | Marketing page incomplete | Current session work |
| 8 | Timeline estimate from original plan no longer authoritative | Build is running longer than 14 weeks | Update timeline after Phase 2 |

---

## Section 5 — Status Summary

- **Island deployed:** YES — `business.janjez.social`
- **Island Supabase:** connected — `fjkzrhyxmjtejjarlxxz`
- **API routes:** 36 (island-side)
- **Migrations:** 30 (island)
- **Remaining major work:** Janjez main API extensions (Phase 2)

---

## Section 6 — How to Use This Document

This is the **living worktree** for the Janjez Business Side build. It combines:

- The Owner's original vision
- The agreed technical architecture
- A live checklist of completed work

**Do not modify Section 1 — it is preserved verbatim as the source of truth.**

---

## Acknowledgment

**Timeline disclaimer:** The 14-week timeline in Section 2 is the original estimate. **It is no longer authoritative.** Actual timeline will be tracked separately based on real velocity and blockers encountered.
