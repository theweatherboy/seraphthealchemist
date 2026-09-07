begin;

create table public.service_instances (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_slug text not null,
  service_title text not null,
  completed_at date not null default current_date,
  verification_note text,
  verified_by uuid not null references public.profiles(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  service_instance_id uuid not null unique references public.service_instances(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null default 5 check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending','approved','rejected','withdrawn','hidden')),
  approved_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_revisions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 20 and 1600 and body !~ '[[:cntrl:]]'),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  moderation_note text,
  moderated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.reviews add constraint reviews_approved_revision_fk
  foreign key (approved_revision_id) references public.review_revisions(id);

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  revision_id uuid references public.review_revisions(id) on delete set null,
  actor_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved','rejected','hidden','withdrawn')),
  reason text,
  created_at timestamptz not null default now()
);

create index service_instances_customer_idx on public.service_instances(customer_id, completed_at desc);
create index reviews_public_idx on public.reviews(status, updated_at desc);
create index review_revisions_review_idx on public.review_revisions(review_id, created_at desc);

alter table public.service_instances enable row level security;
alter table public.reviews enable row level security;
alter table public.review_revisions enable row level security;
alter table public.moderation_events enable row level security;

revoke all on public.service_instances, public.reviews, public.review_revisions, public.moderation_events from public, anon, authenticated;
grant select, insert, update on public.service_instances to authenticated;
grant select, insert on public.reviews to authenticated;
grant select on public.review_revisions to authenticated;
grant select on public.reviews, public.review_revisions to anon;
grant select on public.moderation_events to authenticated;

create function public.is_sanctuary_admin(actor uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_memberships where user_id = actor);
$$;
revoke all on function public.is_sanctuary_admin(uuid) from public, anon, authenticated;
grant execute on function public.is_sanctuary_admin(uuid) to authenticated;

create policy instances_customer_read on public.service_instances for select to authenticated
  using (customer_id = (select auth.uid()) or public.is_sanctuary_admin());
create policy instances_admin_insert on public.service_instances for insert to authenticated
  with check (public.is_sanctuary_admin() and verified_by = (select auth.uid()));
create policy instances_admin_update on public.service_instances for update to authenticated
  using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());

create policy profiles_admin_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_sanctuary_admin());

create policy reviews_public_approved on public.reviews for select to anon, authenticated
  using (status = 'approved');
create policy reviews_owner_read on public.reviews for select to authenticated
  using (customer_id = (select auth.uid()) or public.is_sanctuary_admin());
create policy reviews_owner_insert on public.reviews for insert to authenticated
  with check (customer_id = (select auth.uid()) and status = 'pending' and approved_revision_id is null and exists (
    select 1 from public.service_instances i where i.id = service_instance_id and i.customer_id = (select auth.uid()) and i.revoked_at is null
  ));
create policy revisions_owner_read on public.review_revisions for select to authenticated
  using (author_id = (select auth.uid()) or public.is_sanctuary_admin());
create policy revisions_public_approved on public.review_revisions for select to anon, authenticated
  using (moderation_status = 'approved' and exists (select 1 from public.reviews r where r.id = review_id and r.status = 'approved'));
create policy revisions_owner_insert on public.review_revisions for insert to authenticated
  with check (author_id = (select auth.uid()) and moderation_status = 'pending' and exists (select 1 from public.reviews r where r.id = review_id and r.customer_id = (select auth.uid()) and r.status in ('pending','rejected')));

create policy moderation_admin_read on public.moderation_events for select to authenticated using (public.is_sanctuary_admin());
create policy moderation_admin_insert on public.moderation_events for insert to authenticated with check (public.is_sanctuary_admin() and actor_id = (select auth.uid()));

create function public.stamp_review_update() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.stamp_review_update() from public, anon, authenticated;
create trigger review_before_update before update on public.reviews for each row execute function public.stamp_review_update();

create or replace function public.submit_review(instance_id uuid, review_body text, review_rating smallint default 5)
returns uuid language plpgsql security definer set search_path = public as $$
declare review_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if char_length(btrim(review_body)) not between 20 and 1600 or review_body ~ '[[:cntrl:]]' or review_rating not between 1 and 5 then raise exception 'invalid review'; end if;
  if not exists (select 1 from service_instances where id = instance_id and customer_id = auth.uid() and revoked_at is null) then raise exception 'service not eligible'; end if;
  insert into reviews(service_instance_id, customer_id, rating) values (instance_id, auth.uid(), review_rating) returning id into review_id;
  insert into review_revisions(review_id, author_id, body) values (review_id, auth.uid(), btrim(review_body));
  return review_id;
exception when unique_violation then raise exception 'review already submitted';
end;
$$;
revoke all on function public.submit_review(uuid, text, smallint) from public, anon;
grant execute on function public.submit_review(uuid, text, smallint) to authenticated;

create view public.public_profile_names as
  select id, public_id, display_name from public.profiles;
grant select on public.public_profile_names to anon, authenticated;

create or replace function public.moderate_review(target_review uuid, target_revision uuid, decision text, reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_sanctuary_admin() then raise exception 'forbidden'; end if;
  if decision not in ('approved','rejected','hidden','withdrawn') then raise exception 'invalid decision'; end if;
  update review_revisions set moderation_status = case when decision = 'approved' then 'approved' else 'rejected' end, moderation_note = reason, moderated_by = auth.uid()
    where id = target_revision and review_id = target_review;
  update reviews set status = decision, approved_revision_id = case when decision = 'approved' then target_revision else null end where id = target_review;
  insert into moderation_events(review_id, revision_id, actor_id, decision, reason) values (target_review, target_revision, auth.uid(), decision, reason);
end;
$$;
revoke all on function public.moderate_review(uuid, uuid, text, text) from public, anon;
grant execute on function public.moderate_review(uuid, uuid, text, text) to authenticated;

commit;
