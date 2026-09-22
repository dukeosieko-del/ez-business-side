-- A4a-1: Affiliate payout requests table
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap source: src/lib/affiliate/payout.ts:19 inserts into this table but no
-- migration created it. Every POST /api/affiliate/payout/request 500s without it.
--
-- Field names match the live insert path (payout.ts) and the payout UI
-- (PayoutRequest.tsx). Both mpesa_ref (server-generated reference) and
-- mpesa_number (user-supplied recipient) are stored.

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 500),
  mpesa_ref TEXT,
  mpesa_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending_admin_approval'
    CHECK (status IN ('pending', 'pending_admin_approval', 'approved', 'paid', 'failed', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  mpesa_receipt TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status, created_at DESC);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- RLS note: this table is server-managed (all writes go through the
-- service_role client, which bypasses RLS). Policy is permissive by design
-- and will be tightened when the admin approval UI lands in A4c.
CREATE POLICY "affiliate_payouts_all" ON affiliate_payouts
  FOR ALL USING (true);

-- DOWN (rollback):
-- DROP TABLE IF EXISTS affiliate_payouts;