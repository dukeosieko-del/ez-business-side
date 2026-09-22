-- A6b-1: child_panels.signup_source — tag child panels at creation
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: the 'child-panel' value exists in the JanjezUser signup_source union
-- (src/lib/auth/verify.ts:9) and the VALID_SIGNUP_SOURCES whitelist
-- (app/api/auth/sync/route.ts:6), but no code path ever assigns it. The
-- child panel auth signup route creates child_users rows, which have no
-- signup_source column, so the tag had nowhere to live.
--
-- Resolution: the panel is the registration unit in child-panel mode. A
-- reseller provisions a child_panels row; that row carries the tag. Child
-- users inherit their panel's tag via the panel_id FK. This is consistent
-- with how child_orders and child_services reference the panel.
--
-- Nullable: legacy panels predate the tagging model.

ALTER TABLE child_panels
  ADD COLUMN IF NOT EXISTS signup_source TEXT;

-- DOWN (rollback):
-- ALTER TABLE child_panels DROP COLUMN IF EXISTS signup_source;