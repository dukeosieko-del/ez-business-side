-- Migration: init_affiliate_referrals
-- Description: Individual referral records attributed to an affiliate.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  visitor_fingerprint TEXT,
  referral_source TEXT,
  converted_order_id UUID,
  order_amount NUMERIC,
  commission_amount NUMERIC CHECK (commission_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'clawback')),
  hold_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
