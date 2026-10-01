begin;
-- Birth Chart was added to the application after the original navigation seed.
-- Keep existing ordering and saved visibility flags intact.
insert into public.navigation_visibility (href, label, sort_order)
values ('/birth-chart', 'Birth Chart', 11)
on conflict (href) do nothing;
commit;
