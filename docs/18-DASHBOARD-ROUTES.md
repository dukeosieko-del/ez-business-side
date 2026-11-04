# Business Side dashboard and child-panel route map

All routes in this document belong to the dedicated Business Side app. No route is added to the frozen Main app.

## Partner dashboard

| Route | Purpose |
|---|---|
| `/dashboard` | Partner overview |
| `/dashboard/panels` | List and provision child panels |
| `/dashboard/panels/[id]` | Panel overview |
| `/dashboard/panels/[id]/services` | Import and price services |
| `/dashboard/panels/[id]/branding` | Logo, colors, and fonts |
| `/dashboard/panels/[id]/copy` | Hero, CTA, footer, and SEO copy |
| `/dashboard/panels/[id]/domain` | Custom domain configuration |
| `/dashboard/panels/[id]/orders` | Tenant-scoped child orders |
| `/dashboard/affiliate` | Referral link, clicks, commissions, payout request |
| `/dashboard/integrations/email` | Brevo API/sender readiness |
| `/dashboard/wallet` | Partner wallet |
| `/dashboard/withdrawals` | Withdrawal requests |

## Public child-panel routes

| Route | Purpose |
|---|---|
| `/[panel]` | Panel landing page |
| `/[panel]/services` | Published catalogue |
| `/[panel]/signup` | Child customer registration |
| `/[panel]/signin` | Child customer sign-in |
| `/[panel]/order/[serviceId]` | Place a service order |
| `/[panel]/orders` | Customer order history |
| `/[panel]/orders/[id]` | Customer order detail |
| `/[panel]/api-keys` | Child-user API key management |

## Child-panel APIs

- `GET /api/child/panels/[panel]/services`
- `POST /api/child/auth/signup`
- `POST /api/child/auth/signin`; `GET` checks the current session
- `GET /api/child/orders`; `POST` creates a demo order only
- `GET /api/child/orders/[id]`
- `GET /api/child/api-keys`; `POST` creates a key; `DELETE /api/child/api-keys/[id]` revokes it
- `GET /api/v1/child/services` and `POST /api/v1/child/orders` use scoped bearer API keys

## Partner and integration APIs

- `GET /api/partner/panels`
- `POST /api/partner/panels/demo`
- `GET /api/partner/panels/[id]/orders` verifies both session and panel ownership
- `GET /api/admin/integrations/brevo/health` is admin-only and read-only
- `GET /api/affiliate/track/click?ref=...` records a click and sets the attribution cookie

## Production gates

- Demo panel publishing is locked.
- Live child orders return 503 until provider fulfilment and settlement are verified.
- Partner M-Pesa activation, wallet deposits, and automatic withdrawals are paused pending callback verification and ledger reconciliation.
- Brevo transactional API readiness is checked, but SMTP relay authentication is not yet probed and no test email is sent.
