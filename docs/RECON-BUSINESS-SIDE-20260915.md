# Business Side Reconnaissance — 2026-09-15

**Author:** Kilo Cloud (Builder)
**Purpose:** Snapshot of current state vs original vision
**Mode:** Documentation write (authorized)

---

## 1. Repository State

- Repo: `dukeosieko-del/ez-business-side`
- Branch: `main`
- HEAD: `c2ba930999d7b13bc133515a42a601e60b667a82`
- Tracked files: 202

## 2. Deployment State

- Vercel project: `ez-business-side`
- Canonical domain: `business.janjez.social`
- Status: Live
- Latest deployment ID: [requires Vercel API access — not available in sandbox]

## 3. Environment Variables

- Expected: 21 (from `.env.example`)
- Actual: [requires server access]
- Missing: All required values are empty in `.env.example` — actual missing list requires Vercel dashboard or `vercel env ls` access
- Notes: Critical missing values include `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JANJEZ_MAIN_API_KEY`, `JANJEZ_MAIN_API_SECRET`, `HMAC_SECRET`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`

## 4. Blockers

Reference Section 4 of BUSINESS-SIDE-WORKTREE.md.

| # | Blocker | Impact |
|---|---------|--------|
| 1 | Janjez main `/oauth/authorize` endpoint missing | SSO login fails with 404 |
| 2 | Janjez main `/api/business/v1/*` endpoints missing | Service import, fulfillment, affiliate conversion blocked |
| 3 | Island M-Pesa Daraja credentials are sandbox placeholders | KES 1,499 activation cannot complete real payment |
| 4 | Pesapal integration not started | Alternative payment gateway unavailable |
| 5 | Card payment integration not started | Card payments unavailable |
| 6 | Full drag-and-drop UI editor is partial | Partners cannot fully customize layout |
| 7 | Landing page final layout in progress | Marketing page incomplete |
| 8 | Timeline estimate from original plan no longer authoritative | Build running longer than 14 weeks |

## 5. Progress vs Original Vision

| Category | Complete | In Progress | Not Started |
|----------|----------|-------------|-------------|
| Reseller | Service catalogue, pricing, checkout | — | — |
| Child Panel | Subdomain provisioning, custom domains, child auth, orders, wallet, services, order sync | — | — |
| Affiliate | Registration, links, tracking, commissions, dashboard, payouts | — | — |
| Payments | M-Pesa (sandbox), child wallet, partner wallet, withdrawals, fee calc | — | Pesapal, Card payments, Admin approval UI |
| UI Editor | Color scheme, copywriting, live preview | Drag-and-drop layout, template presets, save/publish | — |
| Main API Integration | — | — | All Phase 2 endpoints (auth middleware, service import, orders, wallet, partner management) |

## 6. Recommendations

1. **Priority 1:** Resolve Janjez main API dependencies (Phase 2). Three critical blockers (#1, #2, and the main API extensions) block downstream functionality. Coordinate with Janjez main team.
2. **Priority 2:** Obtain production M-Pesa Daraja credentials. Sandbox only allows testing, not live activation.
3. **Priority 3:** Fill missing environment variables on Vercel before beta launch. At least 9 critical values are empty.
4. **Priority 4:** Complete landing page finalization — currently in progress per recent commits.
5. **Consider:** Update timeline estimate after Phase 2 completion. Current 14-week estimate is no longer valid.

## 7. Next Steps

1. Owner to provide Janjez main API access / Phase 2 requirements
2. Owner to provide M-Pesa Daraja production credentials
3. Kilo Cloud to complete landing page hero overlay verification (passed on session branch — panel renders correctly at viewport bottom on desktop and mobile)
4. Owner to review and sign off on Phase 2 scope
5. Update BUSINESS-SIDE-WORKTREE.md timeline section after Phase 2 scoping
