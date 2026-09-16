begin;
create table public.navigation_visibility (
  href text primary key check (href ~ '^/[a-z0-9-]*(/[a-z0-9-]+)*$'),
  label text not null check (char_length(btrim(label)) between 2 and 80),
  is_visible boolean not null default true,
  sort_order smallint not null unique check (sort_order between 0 and 100),
  updated_at timestamptz not null default now()
);
alter table public.navigation_visibility enable row level security;
revoke all on public.navigation_visibility from public, anon, authenticated;
grant select on public.navigation_visibility to anon, authenticated;
grant update on public.navigation_visibility to authenticated;
create policy navigation_visibility_public_read on public.navigation_visibility for select to anon, authenticated using (true);
create policy navigation_visibility_admin_update on public.navigation_visibility for update to authenticated using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());
insert into public.navigation_visibility (href, label, sort_order) values
  ('/', 'Home', 0), ('/about', 'About', 1), ('/services', 'Services', 2), ('/grimoire', 'Grimoire', 3), ('/reviews', 'Testimonies', 4), ('/forge', 'Offerings', 5), ('/support', 'Support', 6), ('/contact', 'Connect', 7), ('/account', 'Account', 8), ('/terms-of-service', 'Terms of Service', 9), ('/privacy-policy', 'Privacy Policy', 10)
on conflict (href) do nothing;
create function public.stamp_navigation_update() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
revoke all on function public.stamp_navigation_update() from public, anon, authenticated;
create trigger navigation_visibility_before_update before update on public.navigation_visibility for each row execute function public.stamp_navigation_update();
commit;
