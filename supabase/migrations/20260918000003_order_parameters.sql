-- B1-3: Captured parameters per placed order (freezes values at order time)

CREATE TABLE IF NOT EXISTS order_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES child_orders(id) ON DELETE CASCADE,
  param_key TEXT NOT NULL,
  param_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, param_key)
);

CREATE INDEX IF NOT EXISTS idx_order_parameters_order_id ON order_parameters(order_id);