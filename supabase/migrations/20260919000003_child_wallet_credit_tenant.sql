-- A4a-3: Fix child_wallet_credit AND child_wallet_debit ledger/wallet paths
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Defects in the original child_wallet_credit() and child_wallet_debit()
-- (20260918000006_webhook_and_wallet.sql):
--
--   1. child_wallet_credit() auto-creates a wallet for a new customer but
--      omitted tenant_id, which is NOT NULL on child_wallets. Any first-time
--      credit call raised:
--        null value in column "tenant_id" of relation "child_wallets"
--
--   2. BOTH functions insert into child_wallet_transactions without tenant_id,
--      which is also NOT NULL. Any successful credit OR debit call raised:
--        null value in column "tenant_id" of relation "child_wallet_transactions"
--
--   child/orders/route.ts:104 calls child_wallet_debit on every child order,
--   so defect 2 blocks the entire order flow once a wallet exists.
--
-- Fix: derive tenant_id internally from the customer's child_panels row
-- (child_users.panel_id -> child_panels.id). This preserves the ORIGINAL
-- parameter signatures, so the existing worktree caller needs zero changes:
--
--   supabase.rpc('child_wallet_debit', {
--     p_customer_id, p_amount_minor, p_reference_type, p_reference_id,
--     p_description, p_created_by
--   })
--
-- This is a CREATE OR REPLACE FUNCTION for both, so it is idempotent and safe
-- to apply on top of the already-applied original.

CREATE OR REPLACE FUNCTION child_wallet_credit(
  p_customer_id UUID,
  p_amount_minor BIGINT,
  p_reference_type TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_tenant_id UUID;
  v_wallet_id UUID;
  v_before BIGINT;
  v_after BIGINT;
BEGIN
  SELECT panel_id INTO v_tenant_id FROM child_users WHERE id = p_customer_id;

  SELECT id, current_balance_minor INTO v_wallet_id, v_before
  FROM child_wallets WHERE customer_id = p_customer_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    INSERT INTO child_wallets (tenant_id, customer_id, current_balance_minor)
    VALUES (v_tenant_id, p_customer_id, 0)
    RETURNING id, current_balance_minor INTO v_wallet_id, v_before;
  END IF;

  v_after := v_before + p_amount_minor;

  UPDATE child_wallets SET current_balance_minor = v_after, updated_at = NOW() WHERE id = v_wallet_id;

  INSERT INTO child_wallet_transactions (
    tenant_id, wallet_id, customer_id, type, amount_minor, balance_before_minor, balance_after_minor,
    reference_type, reference_id, description, created_by
  ) VALUES (
    v_tenant_id, v_wallet_id, p_customer_id, 'credit', p_amount_minor, v_before, v_after,
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
  v_tenant_id UUID;
  v_wallet_id UUID;
  v_before BIGINT;
  v_after BIGINT;
BEGIN
  SELECT panel_id INTO v_tenant_id FROM child_users WHERE id = p_customer_id;

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
    tenant_id, wallet_id, customer_id, type, amount_minor, balance_before_minor, balance_after_minor,
    reference_type, reference_id, description, created_by
  ) VALUES (
    v_tenant_id, v_wallet_id, p_customer_id, 'debit', p_amount_minor, v_before, v_after,
    p_reference_type, p_reference_id, p_description, p_created_by
  );

  RETURN v_after;
END;
$$ LANGUAGE plpgsql;

-- DOWN (rollback): no safe rollback for a function body fix; the original
-- behaviour was broken, so reverting would re-introduce both NOT NULL faults.
-- To restore the original, re-apply 20260918000006_webhook_and_wallet.sql verbatim.