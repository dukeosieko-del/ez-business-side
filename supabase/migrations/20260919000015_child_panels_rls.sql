-- A6d-1: child_panels RLS policies
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: child_panels already had ENABLE ROW LEVEL SECURITY (migration
-- 20250101000002_init_child_panels.sql) but no policy. The tenant resolver
-- (src/lib/tenant/context.ts:getPanelContext) reads child_panels anonymously
-- to render subdomain branding, so a blocking policy would break tenant
-- rendering. This policy uses USING (true) to preserve that behaviour while
-- bringing the table in line with the B1 convention.
--
-- Pattern: matches 20260918000006_webhook_and_wallet lines 160-164.
-- All writes go through the service_role client, which bypasses RLS.

ALTER TABLE child_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_panels_all" ON child_panels
  FOR ALL USING (true);

-- DOWN (rollback):
-- DROP POLICY IF EXISTS "child_panels_all" ON child_panels;