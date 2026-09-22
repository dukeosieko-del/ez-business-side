-- A5e-1: Reseller commissions table
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: the reseller dashboard computed totalCommission in real-time from
-- panel orders (reseller/page.tsx:168). No persisted record existed, so there
-- was no reconciliation surface, no audit trail, and no way to query totals
-- without a full order scan. This table gives commissions a durable home.
--
-- commission_amount = markup (the reseller's margin on the order).
-- base_price = the wholesale cost the reseller paid (A5a integration).

CREATE TABLE IF NOT EXISTS reseller_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES child_orders(id) ON DELETE CASCADE,
  base_price NUMERIC NOT NULL CHECK (base_price >= 0),
  markup_amount NUMERIC NOT NULL CHECK (markup_amount >= 0),
  commission_amount NUMERIC NOT NULL CHECK (commission_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'clawed_back', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reseller_commissions_order ON reseller_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_reseller_commissions_reseller ON reseller_commissions(reseller_id, status, created_at DESC);

ALTER TABLE reseller_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reseller_commissions_all" ON reseller_commissions
  FOR ALL USING (true);

-- DOWN (rollback):
-- DROP TABLE IF EXISTS reseller_commissions;