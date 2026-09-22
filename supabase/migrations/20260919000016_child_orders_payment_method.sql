-- A6f-1: child_orders.payment_method CHECK constraint
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: child_orders.payment_method is a free-text column with no constraint.
-- The codebase uses three values: 'mpesa' (M-Pesa STK push), 'wallet' (child
-- wallet balance), and 'manual' (admin-processed / offline). Without a CHECK
-- constraint any string could be stored, corrupting reporting and the
-- fulfillment pipeline.
--
-- Safe to add: the column is nullable and existing rows are NULL, which is
-- not in the allowed set but is permitted because the constraint only fires
-- on non-null values.

ALTER TABLE child_orders
  ADD CONSTRAINT child_orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('mpesa', 'wallet', 'manual'));

-- DOWN (rollback):
-- ALTER TABLE child_orders DROP CONSTRAINT IF EXISTS child_orders_payment_method_check;