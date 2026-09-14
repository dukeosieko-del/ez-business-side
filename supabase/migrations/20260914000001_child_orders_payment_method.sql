-- Add payment_method column to child_orders (Business Side island)
-- Additive only — existing rows remain valid (column is nullable)

ALTER TABLE public.child_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

COMMENT ON COLUMN public.child_orders.payment_method IS
  'Payment source for Business Side child orders: wallet, mpesa, manual. Null for legacy orders.';