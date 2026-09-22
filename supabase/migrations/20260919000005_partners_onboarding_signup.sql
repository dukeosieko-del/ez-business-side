-- A4c-2: partners.onboarding_state + partners.signup_source
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: app/api/auth/sync/route.ts selects and inserts both columns on every
-- auth bridge call (login + partner creation). Neither existed, so:
--   - SELECT returned 42703 -> the sync route's fetchError path fired,
--     re-creating the partner on every login instead of returning the
--     existing row.
--   - INSERT returned 42703 -> first-ever partner creation 500s.
--
-- onboarding_state drives the partner dashboard onboarding checklist.
-- signup_source is the A2 auth-tagging field (business-side provenance).
--
-- Both nullable so legacy rows survive.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS onboarding_state TEXT,
  ADD COLUMN IF NOT EXISTS signup_source TEXT;

-- DOWN (rollback):
-- ALTER TABLE partners DROP COLUMN IF EXISTS onboarding_state;
-- ALTER TABLE partners DROP COLUMN IF EXISTS signup_source;