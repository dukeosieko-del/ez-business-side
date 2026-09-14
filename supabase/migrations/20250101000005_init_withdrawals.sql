-- Migration: init_withdrawals
-- Description: Partner withdrawal requests with fee and M-Pesa tracking.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 500),
  fee NUMERIC NOT NULL CHECK (fee >= 0),
  net_amount NUMERIC NOT NULL CHECK (net_amount >= 0),
  mpesa_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'paid', 'failed')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  paid_at TIMESTAMPTZ,
  mpesa_receipt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_partner_id ON withdrawal_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
