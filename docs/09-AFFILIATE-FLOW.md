# Affiliate links, attribution, and commission tracking

## Referral URL

The dashboard generates links in this form:

`https://business.janjez.social/api/affiliate/track/click?ref=<affiliate_code>`

The click endpoint validates the code, derives IP and user-agent from request headers (not query parameters), stores a hashed fingerprint and click record, sets the opaque `janjez_affiliate_click` HTTP-only cookie for up to 30 days, then redirects to the Business Side landing page. The cookie is scoped to `.janjez.social` so it can be read by Business Side subdomains.

## Attribution schema

- `affiliate_clicks.affiliate_id` ties the click to an affiliate record.
- `affiliate_clicks.click_token` is a random UUID stored in the HTTP-only cookie.
- `affiliate_clicks.fingerprint` is SHA-256 over the server-derived IP and user-agent.
- The dashboard shows referral code, timestamp, and conversion state; it does not expose visitor IP or user-agent.
- RLS is enabled and public/anon/authenticated access is denied; server service-role operations handle attribution.

## Commissions

`recordAffiliateCommissionForPaidOrder(orderId, clickToken)` is the internal conversion helper. It refuses unpaid and demo orders, checks affiliate attribution and commission rate, creates one pending commission per order, and applies a 14-day hold. A unique index on `affiliate_commissions.order_id` prevents duplicate commission records.

The public `POST /api/affiliate/convert` endpoint is disabled (410). A browser must not be allowed to declare its own conversion or submit a spoofed customer IP/user-agent.

## Payout state

Affiliate payout requests can be recorded, but M-Pesa disbursement is not enabled in this build. A pending commission or payout request is not proof of funds paid. Automated payout remains disabled until B2C callbacks, wallet reservation/refund, and reconciliation are verified.

## Current limitation

The click and commission primitives are in place, but the commission helper is not yet called from a verified live payment-settlement callback. Demo orders never create commissions.
