-- A6a-2: child_panels.name — provision.ts returns a name column that doesn't exist
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: src/lib/panels/provision.ts:73 returns `{ name: 'Demo Panel' }` and the
-- DemoPanel interface (provision.ts:24) declares a name field, but
-- child_panels (migration 20250101000002_init_child_panels.sql) has no name
-- column. The select() at provision.ts:44 also omits name, so the returned
-- object is fabricated rather than read — a silent data lie that would break
-- any caller that persists it.
--
-- Nullable: legacy panels predate the name field.

ALTER TABLE child_panels
  ADD COLUMN IF NOT EXISTS name TEXT;

CREATE INDEX IF NOT EXISTS idx_child_panels_name ON child_panels(name);

-- DOWN (rollback):
-- ALTER TABLE child_panels DROP COLUMN IF EXISTS name;