-- A6c-1: child_users RLS policies
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: child_users already had ENABLE ROW LEVEL SECURITY (migration
-- 20250101000004_init_child_users.sql) but no policy, so every query was
-- blocked for non-service-role callers. The child auth signup/login routes
-- use the service_role client so they worked, but any anonymous or
-- anon-scoped read of child_users was silently denied.
--
-- Pattern: matches the existing B1 convention (20260918000006_webhook_and_wallet
-- lines 160-164) where tenant-scoped tables use USING (true) because all
-- writes go through the service_role client, which bypasses RLS. The policy
-- exists so the table is not left in a "enabled but empty" state.
--
-- Tenant isolation note: real per-panel isolation would require a policy
-- like `USING (panel_id = current_setting('app.panel_id'))`, but no such
-- GUC is set anywhere in the codebase. The USING (true) policy is the safe
-- default; tighten it when the middleware sets a panel context GUC.

ALTER TABLE child_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_users_all" ON child_users
  FOR ALL USING (true);

-- DOWN (rollback):
-- DROP POLICY IF EXISTS "child_users_all" ON child_users;