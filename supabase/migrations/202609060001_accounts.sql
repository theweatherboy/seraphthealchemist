begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_id uuid not null unique default gen_random_uuid(),
  display_name text not null default 'Sanctuary member'
    check (char_length(btrim(display_name)) between 2 and 60 and display_name !~ '[[:cntrl:]]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admin_memberships enable row level security;

revoke all on public.profiles from public, anon, authenticated;
revoke all on public.admin_memberships from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.admin_memberships to authenticated;

create policy profiles_read_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy admin_read_own_membership on public.admin_memberships for select to authenticated
  using (user_id = (select auth.uid()));

create function public.create_sanctuary_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Do not publish Google metadata or derive privileges from user-editable metadata.
  insert into public.profiles(id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_sanctuary_profile() from public, anon, authenticated;

create trigger sanctuary_profile_after_signup after insert on auth.users
  for each row execute function public.create_sanctuary_profile();

create function public.stamp_profile_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.stamp_profile_update() from public, anon, authenticated;
create trigger sanctuary_profile_before_update before update on public.profiles
  for each row execute function public.stamp_profile_update();

-- Provision any accounts that signed in before this migration was installed.
insert into public.profiles(id) select id from auth.users on conflict (id) do nothing;

commit;
