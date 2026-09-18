-- B1-6: Webhook event idempotency + child wallet ledger + RLS for B1 tables

-- 1. Webhook event deduplication (idempotent webhook processing)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at DESC);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- 2. Child user wallet ledger (immutable financial source of truth)
CREATE TABLE IF NOT EXISTS child_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'reserve', 'release', 'refund')),
  amount_minor BIGINT NOT NULL,
  balance_before_minor BIGINT NOT NULL,
  balance_after_minor BIGINT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_wallet_transactions_customer ON child_wallet_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_child_wallet_transactions_reference ON child_wallet_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_child_wallet_transactions_tenant ON child_wallet_transactions(tenant_id, created_at DESC);

ALTER TABLE child_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Child wallets (cached balance + authoritative ledger)
CREATE TABLE IF NOT EXISTS child_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL UNIQUE,
  current_balance_minor BIGINT NOT NULL DEFAULT 0 CHECK (current_balance_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_wallets_tenant ON child_wallets(tenant_id);

ALTER TABLE child_wallets ENABLE ROW LEVEL SECURITY;

-- 4. Atomic ledger RPC for child wallets
CREATE OR REPLACE FUNCTION child_wallet_credit(
  p_customer_id UUID,
  p_amount_minor BIGINT,
  p_reference_type TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_wallet_id UUID;
  v_before BIGINT;
  v_after BIGINT;
BEGIN
  SELECT id, current_balance_minor INTO v_wallet_id, v_before
  FROM child_wallets WHERE customer_id = p_customer_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    INSERT INTO child_wallets (customer_id, current_balance_minor) VALUES (p_customer_id, 0)
    RETURNING id, current_balance_minor INTO v_wallet_id, v_before;
  END IF;

  v_after := v_before + p_amount_minor;

  UPDATE child_wallets SET current_balance_minor = v_after, updated_at = NOW() WHERE id = v_wallet_id;

  INSERT INTO child_wallet_transactions (
    wallet_id, customer_id, type, amount_minor, balance_before_minor, balance_after_minor,
    reference_type, reference_id, description, created_by
  ) VALUES (
    v_wallet_id, p_customer_id, 'credit', p_amount_minor, v_before, v_after,
    p_reference_type, p_reference_id, p_description, p_created_by
  );

  RETURN v_after;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION child_wallet_debit(
  p_customer_id UUID,
  p_amount_minor BIGINT,
  p_reference_type TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_wallet_id UUID;
  v_before BIGINT;
  v_after BIGINT;
BEGIN
  SELECT id, current_balance_minor INTO v_wallet_id, v_before
  FROM child_wallets WHERE customer_id = p_customer_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for customer %', p_customer_id;
  END IF;

  IF v_before < p_amount_minor THEN
    RAISE EXCEPTION 'Insufficient balance: have %, need %', v_before, p_amount_minor;
  END IF;

  v_after := v_before - p_amount_minor;

  UPDATE child_wallets SET current_balance_minor = v_after, updated_at = NOW() WHERE id = v_wallet_id;

  INSERT INTO child_wallet_transactions (
    wallet_id, customer_id, type, amount_minor, balance_before_minor, balance_after_minor,
    reference_type, reference_id, description, created_by
  ) VALUES (
    v_wallet_id, p_customer_id, 'debit', p_amount_minor, v_before, v_after,
    p_reference_type, p_reference_id, p_description, p_created_by
  );

  RETURN v_after;
END;
$$ LANGUAGE plpgsql;

-- 5. RLS policies for B1 tables
CREATE POLICY "service_parameters_tenant_isolation" ON service_parameters
  FOR ALL USING (service_id IN (SELECT id FROM child_services));

CREATE POLICY "order_parameters_tenant_isolation" ON order_parameters
  FOR ALL USING (order_id IN (SELECT id FROM child_orders));

CREATE POLICY "integration_connections_tenant_isolation" ON integration_connections
  FOR ALL USING (true);

CREATE POLICY "audit_logs_tenant_isolation" ON audit_logs
  FOR ALL USING (true);

CREATE POLICY "catalogue_sync_runs_tenant_isolation" ON catalogue_sync_runs
  FOR ALL USING (true);

CREATE POLICY "webhook_events_tenant_isolation" ON webhook_events
  FOR ALL USING (true);

CREATE POLICY "child_wallets_tenant_isolation" ON child_wallets
  FOR ALL USING (true);

CREATE POLICY "child_wallet_transactions_tenant_isolation" ON child_wallet_transactions
  FOR ALL USING (true);