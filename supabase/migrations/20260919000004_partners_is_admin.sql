-- A4c-1: partners.is_admin — admin auth column
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: src/lib/admin/auth.ts:12 selects partners.is_admin to gate every admin
-- route (withdrawal approve/reject, admin dashboard, audit log). The column
-- did not exist, so isAdmin() returned false for ALL callers — the entire
-- admin surface was unreachable. Every POST /api/admin/withdrawal/[id]/approve
-- returned 401.
--
-- Nullable: legacy rows predate the admin role model.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- DOWN (rollback):
-- ALTER TABLE partners DROP COLUMN IF EXISTS is_admin;