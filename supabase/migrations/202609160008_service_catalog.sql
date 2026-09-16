begin;

-- Public offering copy only; historical service titles remain snapshots.
create table public.service_catalog (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,120}$'),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  subtitle text not null check (char_length(btrim(subtitle)) between 2 and 200),
  description text not null check (char_length(btrim(description)) between 10 and 3000),
  price numeric(10,2) not null check (price between 0 and 999999),
  duration text not null check (char_length(btrim(duration)) between 2 and 80)
);
alter table public.service_catalog enable row level security;
revoke all on public.service_catalog from public, anon, authenticated;
grant select on public.service_catalog to anon, authenticated;
grant insert, update on public.service_catalog to authenticated;
create policy service_catalog_read on public.service_catalog for select to anon, authenticated using (true);
create policy service_catalog_insert on public.service_catalog for insert to authenticated
  with check (public.is_sanctuary_admin());
create policy service_catalog_update on public.service_catalog for update to authenticated
  using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());

insert into public.service_schedule_policies(service_slug, duration_minutes)
values ('mini-cord-cut', 15), ('mediumship', 15), ('psychic-reading', 10)
on conflict (service_slug) do nothing;

commit;
