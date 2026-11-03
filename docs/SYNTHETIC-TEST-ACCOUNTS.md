# Business Side — Synthetic Test Account Guide (Probation)

Target project: Supabase `fjkzrhyxmjtejjarlxxz` (Business Side only). Never touch frozen main app.

## 1. Required test identities
- Tenant A owner (partner) — email: test-owner-a@business-side.test
- Tenant B owner (partner) — email: test-owner-b@business-side.test
- Reseller child user under Tenant A
- Affiliate user under Tenant A
- Admin user (role elevated via DB, not UI bypass)

## 2. Registration steps (supported workflow)
1. Visit https://business.janjez.social/auth/sign-up
2. Register with synthetic email + password.
3. Supabase Auth creates auth.users row.
4. Partner row created on first authenticated request (via /api/auth/sync or onboarding).
5. Complete onboarding at /dashboard/onboarding.

## 3. Two independent tenants
- Register two distinct accounts (Tenant A, Tenant B).
- Each gets own partner row (janjez_user_id = Supabase user id).
- Tenant isolation enforced by RLS on child_panels, child_users, child_orders, etc.

## 4. Reseller / child-panel users
- Use /dashboard/panels to provision child panel (cost KES 1499 in production; sandbox only).
- Child users created via child panel auth flows.

## 5. Affiliate attribution
- Register affiliate via /api/affiliate/register with partner session.
- Generate affiliate code; track via /api/affiliate/track with referral code.

## 6. Admin verification
- Elevate role in DB directly (service_role) for a synthetic partner: set partners.is_admin = true.
- Verify admin routes (/admin/*) require admin role server-side.

## 7. Environment
- NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY point to fjkzrhyxmjtejjarlxxz.
- MPESA_ENV=sandbox for testing (no real payments).

## 8. Cleanup
- Delete synthetic partners, child_panels, child_users, child_orders, affiliates, sessions via service_role.
- Delete auth.users rows for test emails.
- Never delete real customer data.