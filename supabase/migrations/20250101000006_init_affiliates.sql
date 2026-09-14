-- Migration: init_affiliates
-- Description: Affiliate accounts linked to Janjez Main user IDs.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  janjez_user_id UUID NOT NULL UNIQUE,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC DEFAULT 0.10 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  total_earned NUMERIC DEFAULT 0 CHECK (total_earned >= 0),
  total_pending NUMERIC DEFAULT 0 CHECK (total_pending >= 0),
  total_paid NUMERIC DEFAULT 0 CHECK (total_paid >= 0),
  mpesa_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_janjez_user_id ON affiliates(janjez_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
