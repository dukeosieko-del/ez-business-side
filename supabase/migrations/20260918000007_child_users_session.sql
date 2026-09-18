-- B1-7: Session token columns for child_users (stateless session validation)

ALTER TABLE child_users
  ADD COLUMN IF NOT EXISTS session_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_child_users_session_token ON child_users(session_token_hash);