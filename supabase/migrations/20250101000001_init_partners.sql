-- Migration: init_partners
-- Description: Base partners table for the Business Side SMM panel platform.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  janjez_user_id UUID NOT NULL UNIQUE,
  janjez_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  activation_paid_at TIMESTAMPTZ,
  activation_amount NUMERIC DEFAULT 1499.00 CHECK (activation_amount >= 0),
  wallet_balance NUMERIC DEFAULT 0 CHECK (wallet_balance >= 0),
  api_key_hash TEXT UNIQUE,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_janjez_user_id ON partners(janjez_user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
