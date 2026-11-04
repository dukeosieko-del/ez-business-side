alter table public.child_orders drop constraint if exists child_orders_status_check;
alter table public.child_orders add constraint child_orders_status_check
  check (status = any (array['pending','processing','completed','failed','failed_refunded','cancelled','demo_completed']::text[]));

alter table public.child_orders drop constraint if exists child_orders_payment_method_check;
alter table public.child_orders add constraint child_orders_payment_method_check
  check (payment_method is null or payment_method = any (array['mpesa','wallet','manual','demo','demo_api']::text[]));
