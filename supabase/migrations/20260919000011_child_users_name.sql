-- A6a-1: child_users.name — the column signup inserts but does not exist
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: app/api/child/auth/signup/route.ts:34 inserts `name` into child_users,
-- but the table (migration 20250101000004_init_child_users.sql) has no name
-- column. Every child panel signup raised a column-does-not-exist error.
--
-- Nullable: existing rows predate the name field. The signup route already
-- validates name as required, so new rows will always carry it.

ALTER TABLE child_users
  ADD COLUMN IF NOT EXISTS name TEXT;

CREATE INDEX IF NOT EXISTS idx_child_users_name ON child_users(name);

-- DOWN (rollback):
-- ALTER TABLE child_users DROP COLUMN IF EXISTS name;