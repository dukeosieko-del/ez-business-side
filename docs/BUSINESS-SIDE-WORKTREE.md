# Janjez Business Side — Worktree

**Created:** 2026-09-15
**Owner:** Project Owner
**Original vision:** Captured verbatim below
**Architecture:** Captured verbatim below
**Status:** Living document — updated as work progresses

---

## Section 1 — Original Vision (Verbatim from Owner)

i need you to collaborate with kilo cloud in designing a bussiness side for the build , it should be created as an island on a separate repository but shall communicate with this build through api , for fulfilment management and data handling , so this  setup shall contain a reseller option for those who need to acquire bulk services for reselling , child panel that will cost ksh 1499 to activate and when set up users can be able to link their own dormains , the build should haave a demo then it will have a production side setup that will prompt for the payment to activate the premium and after that they can access the dashboard that allows them to modifythe site to fit their custom business demands allow for mpesa , pesapal and card payment ststem plugins and also an easy guided setup it will enable users to import services from janjez directory through silent api operations and allow them to adjust the particulars of a service to meet  their demands , also those who dont have mpesa details can rely on the fullfilment of services through janjes as at their prices and will have an option to prompt payments of their sales to their verified mpesa numbers , so for this one the users can sell for their own prices but automatically using their alances on janjez to fullfil their services they can access the services that have been ordered in their child panels , user data and anything that does not need elavation from the main build in order run , it should besecure enoughn not to pick sernsitive data from the main build ,when they request for their payments from sales they should face a ficve percent charge for convenience based on any withdrawals from sales they made , if they dont have balances on their janjez accounts the system should return an error message and should not process services without the exact amount that is required on fullfilment ,userd can also edit the ui e.g colour copy write the ui to their feel , i.e drang and drop no technical setups and the accounts should rely on the janjez.social accounts linked to the user ,one cant have a child panel before having a primary janjez.social account , also the sellers here cannot withdraw ammounts below ksh five hundred , also payments requested must be approved by an admin on janjez.social the last option is the affiliate section for marketers content creators and anybody who wants to sell and earn a commision , a fully tracked system should be created in order to facilitate the affiliate section , this is how i have contemplated it , it should e capable of generating affiliate links and codes for users to share on their content inn order to track the exact sales that will come from that end , per user , they should also have a dashboard that tracks their sales amounts , payments , separated in earned , pending and  completed so the orders from their users should be able to be tracked in theeir panels , their remitance shall be made to their mpesa registered numbers and they will earn ten percent of every sales , this is an enomous build so it needs alot of attention  and time also let me know what you know about child panels , and the other provisions i requested for , desctie the matcherbility of this new set up to the current build , prescribe the best wat foward and AOB

---

## Section 2 — Agreed Architectural Proposal (Verbatim from 2026-09-11)

JANJEZ BUSINESS SIDE — ARCHITECTURAL PROPOSAL & STRATEGIC PLAN
Prepared for: Project Owner
Prepared by: DeepSeek (Project Manager) in collaboration with Kilo Cloud (QA)
Date: 2026-09-11
Status: CONCEPTUAL DESIGN — NO CODE WRITTEN YET

EXECUTIVE SUMMARY
You have described a multi-tenant SaaS platform with three primary product lines:

Reseller Program — Bulk services for resellers (existing model, needs dedicated tooling)

Child Panel System — Full white-label SMM panels (KES 1,499 activation)

Affiliate Program — Commission-based referrers (10% per sale)

Plus a payment/fulfillment bridge to the main Janjez build.

This is not a small addition — it is a second product. It must be built as an isolated service that talks to Janjez via authenticated APIs. It cannot be a module inside the current build without severe architectural risk to production.

My recommendation: Build it as a standalone Next.js application in a separate repository, deployed on a separate Lightsail instance, with a well-defined API contract to Janjez. Below is the complete design.

PART 1 — WHAT I KNOW ABOUT CHILD PANELS
Let me first anchor the terminology, because "child panel" is used in the SMM industry with specific meaning.

Industry Context — SMM Child Panels
A child panel (also called a "sub-panel" or "white-label panel") is a clone of an SMM panel that:

Is fully branded by the child owner (logo, colors, domain, pricing)

Pulls its service catalogue from the parent panel via API

Forwards orders to the parent panel for fulfillment

Keeps its own users, orders, and pricing

Charges its own prices to its customers (markup over parent pricing)

Pays the parent panel for actual fulfillment (wallet-based)

Manages its own withdrawals (payout of profits to child owner)

Standard Child Panel Mechanics (Industry)
Aspect	Behavior
Parent API	Parent exposes services, add_order, status, balance, refill, cancel endpoints
Child API	Child runs its own panel with its own API compatible with industry standard
Authentication	Child uses parent-issued API key
Pricing	Child sets own markup (e.g., 1.5x parent price)
Fulfillment	Child order → child debits child user wallet → child places parent order → parent debits child wallet → parent fulfills
Drip-feed	Child may disable drip-feed or restrict to parent's capability
Withdrawals	Child users request withdrawal → child owner approves → child pays out
Panel Status	Active/Suspended — parent can suspend child for ToS violations

What Your Request Adds
Element	Your Specification
Activation fee	KES 1,499 one-time
Domain linking	Custom domain support
Payment gateways	M-Pesa, Pesapal, card plugins
Import services	From Janjez directory via silent API
Price adjustment	Per-service editing
Fallback fulfillment	Use Janjez wallet if child has no M-Pesa
Withdrawal	Withdraw to M-Pesa, min KES 500, admin approval, 5% fee
Wallet enforcement	Exact amount required to fulfill
UI editing	Drag-and-drop, color, copywriting
Account linkage	Child panel tied to Janjez account
Prerequisite	Must have Janjez account first

This is a full-fledged SaaS product. It is comparable to what SMMPanel providers like PerfectPanel, WizPanel, or SMMFlare offer as products.

PART 2 — SYSTEM ARCHITECTURE (BEST WAY FORWARD)
Three-Tier Architecture
text
┌─────────────────────────────────────────────────────────────────┐
│                    JANJEZ.SOCIAL (MAIN BUILD)                    │
│                                                                  │
│  - Customer-facing SMM panel                                     │
│  - Owns provider_services (DripFeed integration)                │
│  - Owns janjez_services (customer catalogue)                     │
│  - Owns M-Pesa payments                                          │
│  - Owns order fulfillment engine                                 │
│  - Owns wallet/balance system                                    │
│                                                                  │
│  Exposes: /api/partner/* endpoints (NEW — to be built)          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS + API key auth
                              │ (server-to-server, not public)
                              │
┌─────────────────────────────────────────────────────────────────┐
│              JANJEZ PARTNER HUB (NEW REPO)                       │
│              "janjez-partner-hub"                                │
│                                                                  │
│  Deployed on: Separate Lightsail instance (or subdomain)         │
│  Hosted at: partners.janjez.social or app.janjez.partners        │
│                                                                  │
│  Contains:                                                       │
│  - Child panel provisioning                                      │
│  - Child panel admin dashboards                                  │
│  - Reseller management                                           │
│  - Affiliate system                                              │
│  - Billing (KES 1,499 + 5% withdrawal fee)                      │
│  - Domain linking (DNS automation)                               │
│  - UI editor (drag-and-drop)                                     │
│  - Multi-tenant site rendering                                   │
│                                                                  │
│  Exposes: /api/child/* endpoints (each child panel's API)       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼───────┐ ┌─────▼─────────┐ ┌──▼──────────────┐
    │ Child Panel A   │ │ Child Panel B │ │ Affiliate User  │
    │ (Reseller X)    │ │ (Reseller Y)  │ │ (Marketer Z)    │
    │ resellerA.com   │ │ resellerB.com │ │ (no domain)     │
    │ users, orders   │ │ users, orders │ │ referral links  │
    └─────────────────┘ └───────────────┘ └─────────────────┘
Why Three Tiers
Tier 1 (Main Janjez): Remains unchanged. Zero risk to production. Continues serving direct customers.

Tier 2 (Partner Hub): New repository. Handles all partner logic. If it fails, main Janjez is unaffected.

Tier 3 (Child Panels): Rendered dynamically by Partner Hub. Each child is a tenant within the Hub, not a separate deployment.

PART 3 — NEW REPOSITORY SPECIFICATION
Repository: janjez-partner-hub
Aspect	Decision
Language	TypeScript
Framework	Next.js 16 (App Router)
Database	Supabase (separate project from Janjez main)
Auth	Supabase Auth (SSO with janjez.social via OAuth)
Deployment	AWS Lightsail (separate instance) OR Vercel
Domain	partners.janjez.social
Child domains	Wildcard subdomain: *.partners.janjez.social + custom domains via CNAME
Email	Own Brevo SMTP configuration
Payments	M-Pesa (Daraja), Pesapal, Stripe/Flutterwave for cards
Database Schema (Partner Hub)
sql
-- Partners (child panel owners)
CREATE TABLE partners (
  id UUID PRIMARY KEY,
  janjez_user_id UUID NOT NULL,        -- FK to Janjez main auth.users
  janjez_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL,                 -- 'pending', 'active', 'suspended'
  activation_paid_at TIMESTAMPTZ,
  activation_amount NUMERIC,
  wallet_balance NUMERIC DEFAULT 0,     -- Partner's wallet for fulfillment
  api_key TEXT UNIQUE NOT NULL,         -- For Janjez API communication
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child Panels (one per partner)
CREATE TABLE child_panels (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES partners(id),
  subdomain TEXT UNIQUE,                -- resellerA.partners.janjez.social
  custom_domain TEXT UNIQUE,            -- resellerA.com
  custom_domain_verified BOOLEAN DEFAULT FALSE,
  branding JSONB,                       -- logo, colors, fonts
  copy JSONB,                           -- headlines, taglines, FAQ
  payment_config JSONB,                 -- M-Pesa, Pesapal, Card creds (encrypted)
  payment_gateways TEXT[],              -- ['mpesa', 'pesapal', 'card']
  status TEXT DEFAULT 'demo',           -- 'demo', 'active', 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Catalogue (imported from Janjez)
CREATE TABLE child_services (
  id UUID PRIMARY KEY,
  panel_id UUID REFERENCES child_panels(id),
  janjez_service_id UUID NOT NULL,      -- FK to main janjez_services.id
  child_price NUMERIC NOT NULL,         -- Child sets this
  child_min_quantity INTEGER,
  child_max_quantity INTEGER,
  is_visible BOOLEAN DEFAULT TRUE,
  is_drip_feed_enabled BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  custom_name TEXT,
  custom_description TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child Users (customers of the child panel)
CREATE TABLE child_users (
  id UUID PRIMARY KEY,
  panel_id UUID REFERENCES child_panels(id),
  email TEXT NOT NULL,
  password_hash TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child Orders
CREATE TABLE child_orders (
  id UUID PRIMARY KEY,
  panel_id UUID REFERENCES child_panels(id),
  child_user_id UUID REFERENCES child_users(id),
  child_service_id UUID REFERENCES child_services(id),
  janjez_order_id UUID,                 -- Once forwarded
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  charge NUMERIC NOT NULL,              -- What child user pays
  cost NUMERIC NOT NULL,                -- What partner pays Janjez
  status TEXT NOT NULL,                 -- 'pending', 'processing', 'completed', 'failed'
  provider_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal Requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES partners(id),
  amount NUMERIC NOT NULL,
  fee NUMERIC NOT NULL,                 -- 5%
  net_amount NUMERIC NOT NULL,
  mpesa_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',        -- 'pending', 'approved', 'rejected', 'paid'
  approved_by UUID,                     -- Janjez admin
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliates
CREATE TABLE affiliates (
  id UUID PRIMARY KEY,
  janjez_user_id UUID NOT NULL,
  affiliate_code TEXT UNIQUE NOT NULL,  -- 'MARKET123'
  affiliate_link TEXT NOT NULL,         -- 'https://janjez.social/?ref=MARKET123'
  commission_rate NUMERIC DEFAULT 0.10, -- 10%
  total_earned NUMERIC DEFAULT 0,
  total_pending NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  mpesa_number TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Referrals (tracked clicks)
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id),
  visitor_fingerprint TEXT,             -- Anonymized
  referral_source TEXT,                 -- 'twitter', 'blog', etc.
  converted_order_id UUID,              -- FK to janjez orders
  commission_earned NUMERIC,
  status TEXT DEFAULT 'pending',        -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UI Templates (for child panel editor)
CREATE TABLE child_ui_templates (
  id UUID PRIMARY KEY,
  panel_id UUID REFERENCES child_panels(id),
  template_name TEXT NOT NULL,          -- 'modern', 'minimal', 'bold'
  components JSONB,                     -- Drag-drop layout
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

PART 4 — API CONTRACT BETWEEN JANJEZ MAIN AND PARTNER HUB
This is the critical interface. Both sides must agree on this.

Janjez Main — New Endpoints (to be built)
Base: https://janjez.social/api/partner/v1/

All requests authenticated via X-Partner-API-Key header.

Endpoint	Method	Purpose
/services	GET	Return full service catalogue (id, name, price, min, max, category, subcategory)
/services/:id	GET	Single service details
/wallet/balance	GET	Return partner's current Janjez wallet balance
/wallet/topup	POST	Initiate M-Pesa STK push to top up partner wallet
/orders	POST	Create fulfillment order (uses partner's Janjez wallet)
/orders/:id	GET	Order status
/orders/:id/status	GET	Detailed status with provider info
/orders/:id/cancel	POST	Cancel order (if provider supports)
/orders/:id/refill	POST	Request refill (if supported)
/partner/register	POST	Register new partner (called by Partner Hub)
/partner/verify	POST	Verify partner activation payment
/affiliate/track	POST	Record affiliate referral click
/affiliate/convert	POST	Record affiliate conversion

Response Format
All responses use consistent envelope:

json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-09-11T12:00:00Z"
}

Error example:

json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Partner wallet balance is insufficient for this order",
    "details": {
      "required": 500,
      "available": 320
    }
  },
  "timestamp": "2026-09-11T12:00:00Z"
}

Example: Create Order Flow
Partner Hub → Janjez Main:

http
POST /api/partner/v1/orders
X-Partner-API-Key: <partner_api_key>
Content-Type: application/json

{
  "janjez_service_id": "uuid-here",
  "link": "https://instagram.com/user",
  "quantity": 1000,
  "partner_order_reference": "child-order-xyz",
  "drip_feed_runs": null,
  "drip_feed_interval": null
}

Janjez Main → Partner Hub:

json
{
  "success": true,
  "data": {
    "janjez_order_id": "uuid",
    "status": "processing",
    "charge": 450,
    "provider_order_id": "DF-12345",
    "estimated_delivery": "2026-09-11T13:00:00Z"
  }
}

PART 5 — KEY BUSINESS LOGIC
5.1 Child Panel Activation Flow
text
User (Janjez account required)
    ↓
Visits partners.janjez.social
    ↓
Clicks "Start Demo"
    ↓
Demo panel created (subdomain: demo-{id}.partners.janjez.social)
    ↓
User explores: imports services, edits prices, customizes UI
    ↓
Clicks "Activate Premium" (KES 1,499)
    ↓
M-Pesa STK push → payment confirmed
    ↓
Panel status: 'demo' → 'active'
    ↓
User can now link custom domain, receive orders

5.2 Fulfillment Flow (Partner → Janjez)
text
Child user places order (e.g., 1000 Instagram followers @ KES 200)
    ↓
Partner Hub:
  - Debits child user balance (KES 200)
  - Credits partner wallet (KES 200)
  - Calculates partner cost (e.g., KES 150 at Janjez price)
    ↓
Partner Hub → Janjez Main: POST /orders
    ↓
Janjez Main:
  - Validates partner wallet has ≥ KES 150
  - IF insufficient → return INSUFFICIENT_BALANCE error
  - IF sufficient → debit partner wallet, place order at DripFeed
    ↓
DripFeed: executes order
    ↓
Janjez Main → Partner Hub: order_id, status
    ↓
Partner Hub: marks child order as 'processing'
    ↓
Ongoing sync: Partner Hub polls or receives webhook
    ↓
Order completes → Partner Hub marks child order 'completed'

5.3 Withdrawal Flow
text
Partner wallet balance: KES 5,000
    ↓
Partner requests withdrawal of KES 3,000
    ↓
System calculates:
  - Gross: KES 3,000
  - Fee (5%): KES 150
  - Net to partner: KES 2,850
    ↓
Validation:
  - Amount ≥ KES 500? YES
  - M-Pesa number verified? YES
  - Wallet balance sufficient? YES
    ↓
Creates withdrawal_request (status: 'pending')
    ↓
Janjez admin reviews in main dashboard
    ↓
Admin approves → status: 'approved'
    ↓
M-Pesa B2C payout initiated
    ↓
Payment confirmed → status: 'paid'
    ↓
Partner wallet debited by KES 3,000

5.4 Affiliate Tracking Flow
text
Affiliate signup → generates unique code: MARKET123
    ↓
Affiliate shares link: janjez.social/?ref=MARKET123
    ↓
Visitor clicks → Janjez records referral (fingerprint, timestamp)
    ↓
Visitor places order
    ↓
Janjez records conversion:
  - Order ID linked to affiliate
  - Commission: 10% of order value
  - Status: 'pending' (until order completes)
    ↓
Order completes → commission status: 'completed'
    ↓
Affiliate dashboard shows:
  - Total earned: KES 1,000
  - Pending: KES 200
  - Completed: KES 800
    ↓
Affiliate requests payout → M-Pesa transfer

PART 6 — MATCHABILITY TO CURRENT BUILD
What Stays in Janjez Main
Feature	Reason
Provider catalogue (DripFeed)	Centralized, one source of truth
Fulfillment engine	Shared with partners via API
M-Pesa STK push integration	Existing infrastructure
Wallet system	Partners use it too
Order tracking	Existing endpoints extended
Admin dashboard	Extended for partner management
Customer auth	SSO to Partner Hub

What Moves to Partner Hub
Feature	Reason
Partner registration	Separate domain, separate auth
Child panel provisioning	Multi-tenant isolation
Domain linking	DNS automation
UI editor	Isolated complexity
Child user management	Different user base
Withdrawal processing	Partner-specific
Affiliate tracking	Different data model
Child panel API	Multi-tenant endpoints
Shared via API
Feature	How
Service catalogue	GET /api/partner/v1/services
Order placement	POST /api/partner/v1/orders
Wallet operations	GET /api/partner/v1/wallet/balance
User SSO	OAuth flow between domains
Referral tracking	POST /api/affiliate/track
Conversion tracking	POST /api/affiliate/convert

No Shared
Item	Reason
Direct database access	Security — separate Supabase projects
Session cookies	Different domains
Sensitive secrets	Partner Hub has its own env vars
User passwords	SSO via OAuth only
Payment credentials	Partner Hub has own M-Pesa

PART 7 — SECURITY ARCHITECTURE
Principle: Partner Hub Cannot Read Sensitive Janjez Data
Kilo Cloud's critical concern: Partner Hub must never access:

Main Janjez users' passwords

Main Janjez payment credentials

Main Janjez admin tokens

Main Janjez private API keys

Main Janjez customer PII beyond what's needed for fulfillment

API-Level Isolation
Partner API keys — Each partner has a unique key, scoped to their own data

Rate limiting — Per-partner rate limits prevent abuse

Input validation — All partner input sanitized before processing

Idempotency keys — Prevent duplicate orders

Request signing — HMAC signatures for critical operations

IP allowlisting — Optional for high-value partners

Data-Level Isolation
Separate Supabase projects — Physical isolation

Minimal data sharing — Partner Hub receives only IDs and prices, not provider details

Encrypted payment credentials — Partner payment gateway creds encrypted at rest

Audit logs — Every API call logged with partner ID, endpoint, timestamp

Network-Level Isolation
Separate Lightsail instance for Partner Hub

Private VPC communication if both on same VPC

TLS-only — No HTTP, no exceptions

Cloudflare protection — DDoS and bot mitigation

PART 8 — PRESCRIBED BUILD SEQUENCE
Phase 1 — Foundation (Weeks 1-2)
□ Create janjez-partner-hub repository
□ Set up Next.js 16 + Supabase + Tailwind
□ Implement SSO OAuth from Janjez main
□ Build user registration/linking flow
□ Set up separate deployment (Lightsail or Vercel)
□ Configure domain partners.janjez.social

Phase 2 — Janjez Main API Extensions (Weeks 2-3)
□ Build /api/partner/v1/* endpoints in Janjez main
□ Add partner authentication middleware
□ Extend wallet for partner top-up
□ Extend order creation for partner-initiated orders
□ Add partner management to Janjez admin
□ Rate limiting and security hardening

Phase 3 — Partner Onboarding (Weeks 3-4)
□ Partner registration flow
□ Demo panel generation
□ Service catalogue import UI
□ Price adjustment interface
□ M-Pesa STK push for KES 1,499 activation
□ Panel status management

Phase 4 — Child Panel Core (Weeks 5-6)
□ Subdomain provisioning
□ Custom domain linking (DNS automation)
□ Child panel rendering engine
□ Child user registration/login
□ Child order placement
□ Order forwarding to Janjez

Phase 5 — UI Editor (Weeks 7-8)
□ Drag-and-drop layout editor
□ Color scheme editor
□ Copywriting editor
□ Template presets
□ Live preview
□ Save/publish workflow

Phase 6 — Payments & Wallets (Weeks 9-10)
□ Child payment gateway integration (M-Pesa, Pesapal, Card)
□ Child wallet system
□ Partner wallet system
□ Withdrawal request flow
□ Admin approval UI in Janjez
□ 5% fee calculation
□ KES 500 minimum enforcement

Phase 7 — Affiliate System (Weeks 11-12)
□ Affiliate registration
□ Affiliate link generation
□ Click tracking (fingerprint + cookie)
□ Conversion tracking
□ Commission calculation (10%)
□ Affiliate dashboard (earned/pending/completed)
□ M-Pesa payout workflow

Phase 8 — Testing & Launch (Weeks 13-14)
□ End-to-end testing across all flows
□ Security penetration testing
□ Load testing
□ Documentation
□ Beta launch with select partners
□ Monitoring and alerting setup

Total estimated time: 14 weeks (3.5 months)

PART 9 — AOB (ANY OTHER BUSINESS)
A. Things You Didn't Ask But Should Consider
Terms of Service & AUP — Child panels must sign acceptable use policy. Parent can suspend for violations (spam, illegal services, etc.).

Dispute Resolution — What happens when a child user complains about a partner? Policy needed.

Data Retention — How long do you keep child panel data after deletion?

Refund Policy — If a child order fails, who refunds? The partner or Janjez?

Service Restrictions — Some services (e.g., "guaranteed refill" or "drip-feed") may need to be restricted for child panels.

Tax Compliance — KES 1,499 activation and 5% withdrawal fees have tax implications.

Pricing Strategy — Will you allow unlimited markup? Or cap it (e.g., 3x parent price)?

Panel Suspension Triggers — Automatic suspension rules (e.g., 3 months inactive, ToS violation, unpaid balance).

Subdomain Squatting — Prevent abuse of subdomain names (e.g., admin.partners.janjez.social).

Custom Domain SSL — Auto-provision Let's Encrypt for each custom domain.

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
