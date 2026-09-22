-- A5e-2: partners.total_commission / pending_commission
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: refreshResellerTotals() writes these columns, but they did not exist.
-- The reseller dashboard previously computed totalCommission in real-time
-- from panel orders (reseller/page.tsx:168) — no persisted record, no
-- reconciliation surface. These two columns give commissions a durable home
-- alongside the existing wallet_balance.
--
-- Both nullable so legacy non-reseller partners are unaffected.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS total_commission NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_commission NUMERIC NOT NULL DEFAULT 0;

-- DOWN (rollback):
-- ALTER TABLE partners DROP COLUMN IF EXISTS total_commission;
-- ALTER TABLE partners DROP COLUMN IF EXISTS pending_commission;