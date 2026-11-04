do $$
declare
  t text;
  p record;
  table_names text[] := array[
    'idempotency_keys','audit_log','wallet_transactions','activation_payments','child_orders',
    'service_parameters','catalogue_sync_runs','order_parameters','integration_connections','audit_logs',
    'affiliate_referrals','affiliates','child_services','notes','partners','sessions','withdrawal_requests',
    'child_wallets','child_wallet_transactions','webhook_events','api_keys','affiliate_payouts',
    'reseller_commissions','wholesale_tiers','child_panels','child_users','affiliate_clicks',
    'affiliate_commissions','child_api_keys','child_api_key_usage'
  ];
begin
  foreach t in array table_names loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('create policy service_only on public.%I for all to public using (false) with check (false)', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
end $$;

alter function public.create_partner_session(uuid, text, timestamptz, inet, text) set search_path = pg_catalog, public;
alter function public.validate_partner_session(text) set search_path = pg_catalog, public;
alter function public.destroy_partner_session(text) set search_path = pg_catalog, public;
alter function public.credit_wallet(uuid, numeric, text, text, jsonb) set search_path = pg_catalog, public;
alter function public.debit_wallet(uuid, numeric, text, text, jsonb) set search_path = pg_catalog, public;
alter function public.audit_logs_prevent_modification() set search_path = pg_catalog, public;
alter function public.child_wallet_debit(uuid, bigint, text, text, text, text) set search_path = pg_catalog, public;
alter function public.child_wallet_credit(uuid, bigint, text, text, text, text) set search_path = pg_catalog, public;

create index if not exists idx_activation_payments_partner_id on public.activation_payments(partner_id);
create index if not exists idx_api_keys_created_by on public.api_keys(created_by);
create index if not exists idx_child_api_keys_child_user_id on public.child_api_keys(child_user_id);
create index if not exists idx_child_orders_service_id on public.child_orders(service_id);
