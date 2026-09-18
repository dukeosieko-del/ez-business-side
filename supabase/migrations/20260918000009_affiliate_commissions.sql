-- B1-9: Affiliate commissions table (referral commission tracking)

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES child_orders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'clawed_back', 'hold')),
  hold_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_order ON affiliate_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);

ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;