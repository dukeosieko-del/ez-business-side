-- B1-1: Catalogue synchronisation run tracking
-- Records every catalogue sync operation against the master Janjez catalogue.

CREATE TABLE IF NOT EXISTS catalogue_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  services_found INTEGER DEFAULT 0,
  services_added INTEGER DEFAULT 0,
  services_updated INTEGER DEFAULT 0,
  services_removed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogue_sync_runs_started_at ON catalogue_sync_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalogue_sync_runs_status ON catalogue_sync_runs(status);