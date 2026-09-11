CREATE OR REPLACE FUNCTION credit_wallet(
  p_partner_id UUID,
  p_amount NUMERIC,
  p_category TEXT,
  p_reference TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS NUMERIC AS $$
DECLARE
  v_before NUMERIC;
  v_after NUMERIC;
BEGIN
  SELECT wallet_balance INTO v_before
  FROM partners WHERE id = p_partner_id FOR UPDATE;

  IF v_before IS NULL THEN
    RAISE EXCEPTION 'Partner not found';
  END IF;

  v_after := v_before + p_amount;

  UPDATE partners SET wallet_balance = v_after WHERE id = p_partner_id;

  INSERT INTO wallet_transactions (
    partner_id, amount, direction, category, reference, balance_before, balance_after, metadata
  ) VALUES (
    p_partner_id, p_amount, 'credit', p_category, p_reference, v_before, v_after, p_metadata
  );

  RETURN v_after;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION debit_wallet(
  p_partner_id UUID,
  p_amount NUMERIC,
  p_category TEXT,
  p_reference TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS NUMERIC AS $$
DECLARE
  v_before NUMERIC;
  v_after NUMERIC;
BEGIN
  SELECT wallet_balance INTO v_before
  FROM partners WHERE id = p_partner_id FOR UPDATE;

  IF v_before IS NULL THEN
    RAISE EXCEPTION 'Partner not found';
  END IF;

  IF v_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_after := v_before - p_amount;

  UPDATE partners SET wallet_balance = v_after WHERE id = p_partner_id;

  INSERT INTO wallet_transactions (
    partner_id, amount, direction, category, reference, balance_before, balance_after, metadata
  ) VALUES (
    p_partner_id, p_amount, 'debit', p_category, p_reference, v_before, v_after, p_metadata
  );

  RETURN v_after;
END;
$$ LANGUAGE plpgsql;