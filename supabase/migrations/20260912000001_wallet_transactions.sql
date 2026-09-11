CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  category TEXT NOT NULL,
  reference TEXT,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_partner ON wallet_transactions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_category ON wallet_transactions(partner_id, category);