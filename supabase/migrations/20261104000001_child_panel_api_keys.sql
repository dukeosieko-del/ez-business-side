create table if not exists public.child_api_keys (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.child_panels(id) on delete cascade,
  child_user_id uuid not null references public.child_users(id) on delete cascade,
  key_id text not null unique,
  key_hash text not null,
  name text not null,
  scopes text[] not null default array['services:read'],
  rate_limit integer not null default 60 check (rate_limit between 1 and 600),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists child_api_keys_owner_idx on public.child_api_keys(panel_id, child_user_id, revoked_at);
create index if not exists child_api_keys_key_id_idx on public.child_api_keys(key_id) where revoked_at is null;

create table if not exists public.child_api_key_usage (
  key_id text not null references public.child_api_keys(key_id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (key_id, window_start)
);

alter table public.child_api_keys enable row level security;
alter table public.child_api_key_usage enable row level security;

drop policy if exists child_api_keys_service_only on public.child_api_keys;
create policy child_api_keys_service_only on public.child_api_keys for all to public using (false) with check (false);
drop policy if exists child_api_key_usage_service_only on public.child_api_key_usage;
create policy child_api_key_usage_service_only on public.child_api_key_usage for all to public using (false) with check (false);

revoke all on public.child_api_keys from anon, authenticated;
revoke all on public.child_api_key_usage from anon, authenticated;
grant select, insert, update, delete on public.child_api_keys to service_role;
grant select, insert, update, delete on public.child_api_key_usage to service_role;

create or replace function public.consume_child_api_key_rate_limit(p_key_id text, p_limit integer)
returns boolean language plpgsql security invoker set search_path = pg_catalog, public as $$
declare
  v_count integer;
  v_window timestamptz := date_trunc('minute', now());
begin
  insert into public.child_api_key_usage (key_id, window_start, request_count)
  values (p_key_id, v_window, 1)
  on conflict (key_id, window_start)
  do update set request_count = public.child_api_key_usage.request_count + 1
  returning request_count into v_count;
  return v_count <= greatest(1, least(p_limit, 600));
end;
$$;

revoke all on function public.consume_child_api_key_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.consume_child_api_key_rate_limit(text, integer) to service_role;
