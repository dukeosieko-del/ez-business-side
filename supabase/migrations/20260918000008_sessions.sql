-- B1-8: Partner session storage for stateful session validation

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_partner ON sessions(partner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Auth session: create, validate, destroy
CREATE OR REPLACE FUNCTION create_partner_session(
  p_partner_id UUID,
  p_token_hash TEXT,
  p_expires_at TIMESTAMPTZ,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS sessions AS $$
DECLARE
  v_session sessions;
BEGIN
  INSERT INTO sessions (partner_id, token_hash, expires_at, ip_address, user_agent)
  VALUES (p_partner_id, p_token_hash, p_expires_at, p_ip_address, p_user_agent)
  RETURNING * INTO v_session;
  RETURN v_session;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_partner_session(p_token_hash TEXT)
RETURNS sessions AS $$
DECLARE
  v_session sessions;
BEGIN
  SELECT * INTO v_session
  FROM sessions
  WHERE token_hash = p_token_hash AND expires_at > NOW()
  LIMIT 1;
  RETURN v_session;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION destroy_partner_session(p_token_hash TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM sessions WHERE token_hash = p_token_hash;
END;
$$ LANGUAGE plpgsql;