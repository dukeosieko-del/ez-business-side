alter table public.affiliate_clicks
  add column if not exists affiliate_id uuid references public.affiliates(id) on delete set null,
  add column if not exists click_token uuid not null default gen_random_uuid();

create unique index if not exists affiliate_clicks_click_token_uidx on public.affiliate_clicks(click_token);
create index if not exists affiliate_clicks_affiliate_time_idx on public.affiliate_clicks(affiliate_id, clicked_at desc);
create unique index if not exists affiliate_commissions_order_uidx on public.affiliate_commissions(order_id);

alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commissions enable row level security;

drop policy if exists affiliate_clicks_service_only on public.affiliate_clicks;
create policy affiliate_clicks_service_only on public.affiliate_clicks for all to public using (false) with check (false);
drop policy if exists affiliate_commissions_service_only on public.affiliate_commissions;
create policy affiliate_commissions_service_only on public.affiliate_commissions for all to public using (false) with check (false);

revoke all on public.affiliate_clicks from anon, authenticated;
revoke all on public.affiliate_commissions from anon, authenticated;
grant select, insert, update, delete on public.affiliate_clicks to service_role;
grant select, insert, update, delete on public.affiliate_commissions to service_role;
