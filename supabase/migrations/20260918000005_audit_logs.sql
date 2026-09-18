-- B1-5: Append-only audit trail for pricing and wallet adjustments
-- Distinct from the existing audit_log table (general-purpose event log).
-- This table captures before/after state for sensitive mutations.

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user','admin','system','webhook')),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);

-- Append-only enforcement
CREATE OR REPLACE FUNCTION audit_logs_prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_prevent_modification();