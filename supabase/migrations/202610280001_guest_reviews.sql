begin;

create table public.guest_reviews (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 60 and first_name !~ '[[:cntrl:]]'),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 60 and last_name !~ '[[:cntrl:]]'),
  service_title text check (service_title is null or (char_length(btrim(service_title)) between 1 and 120 and service_title !~ '[[:cntrl:]]')),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(btrim(body)) between 20 and 1600 and body !~ '[[:cntrl:]]'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  moderated_at timestamptz
);

create index guest_reviews_public_idx on public.guest_reviews(status, created_at desc);
alter table public.guest_reviews enable row level security;
revoke all on public.guest_reviews from public, anon, authenticated;
grant select on public.guest_reviews to anon, authenticated;

create policy guest_reviews_public_read on public.guest_reviews for select to anon, authenticated
  using (status = 'approved');
create policy guest_reviews_admin_read on public.guest_reviews for select to authenticated
  using (public.is_sanctuary_admin());

create function public.submit_guest_review(
  guest_first_name text, guest_last_name text, guest_service_title text,
  guest_rating smallint, guest_body text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if char_length(btrim(guest_first_name)) not between 1 and 60 or guest_first_name ~ '[[:cntrl:]]'
    or char_length(btrim(guest_last_name)) not between 1 and 60 or guest_last_name ~ '[[:cntrl:]]'
    or (nullif(btrim(guest_service_title), '') is not null and (char_length(btrim(guest_service_title)) > 120 or guest_service_title ~ '[[:cntrl:]]'))
    or guest_rating not between 1 and 5 or char_length(btrim(guest_body)) not between 20 and 1600
    or guest_body ~ '[[:cntrl:]]' then
    raise exception 'invalid guest review';
  end if;
  insert into public.guest_reviews(first_name, last_name, service_title, rating, body)
  values (btrim(guest_first_name), btrim(guest_last_name), nullif(btrim(guest_service_title), ''), guest_rating, btrim(guest_body))
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.submit_guest_review(text, text, text, smallint, text) from public, anon, authenticated;
grant execute on function public.submit_guest_review(text, text, text, smallint, text) to anon, authenticated;

create function public.moderate_guest_review(target_review uuid, decision text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_sanctuary_admin() then raise exception 'forbidden'; end if;
  if decision not in ('approved', 'rejected') then raise exception 'invalid decision'; end if;
  update public.guest_reviews set status = decision, moderated_at = now()
    where id = target_review and status = 'pending';
  if not found then raise exception 'guest review unavailable'; end if;
end;
$$;
revoke all on function public.moderate_guest_review(uuid, text) from public, anon, authenticated;
grant execute on function public.moderate_guest_review(uuid, text) to authenticated;

commit;
