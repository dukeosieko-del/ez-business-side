CREATE TABLE IF NOT EXISTS child_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES child_panels(id),
  service_id UUID NOT NULL REFERENCES child_services(id),
  child_user_id UUID NOT NULL REFERENCES child_users(id),
  quantity INTEGER NOT NULL,
  link TEXT NOT NULL,
  charge NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  markup NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'failed_refunded', 'cancelled')),
  janjez_order_id TEXT,
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  fulfillment_log JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_child_orders_panel ON child_orders(panel_id, created_at DESC);
CREATE INDEX idx_child_orders_user ON child_orders(child_user_id, created_at DESC);
CREATE INDEX idx_child_orders_status ON child_orders(status);
CREATE INDEX idx_child_orders_janjez ON child_orders(janjez_order_id);