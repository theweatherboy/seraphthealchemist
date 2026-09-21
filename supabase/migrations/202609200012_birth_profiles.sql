begin;
create table public.birth_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date not null check (birth_date between date '1900-01-01' and current_date),
  birth_time time without time zone not null check (birth_time < time '24:00:00'),
  place_label text not null check (char_length(btrim(place_label)) between 1 and 300),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  timezone text not null check (char_length(timezone) between 1 and 100),
  storage_consent boolean not null check (storage_consent = true),
  consent_version text not null check (consent_version = 'birth-details-v1'),
  consent_granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.birth_profiles enable row level security;
revoke all on public.birth_profiles from public, anon, authenticated;
grant select, insert, update, delete on public.birth_profiles to authenticated;
create policy birth_profiles_read_own on public.birth_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy birth_profiles_insert_own on public.birth_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy birth_profiles_update_own on public.birth_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy birth_profiles_delete_own on public.birth_profiles for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.birth_profiles is 'Optional birth details saved only with explicit user consent. Owner-only access; no public or app-admin policy.';
commit;
