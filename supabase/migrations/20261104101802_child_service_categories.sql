alter table public.child_services add column if not exists category text;
create index if not exists idx_child_services_panel_category on public.child_services(panel_id, category);
