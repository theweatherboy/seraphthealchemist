begin;

alter table public.service_catalog
  add column category text check (category in ('seer', 'healer', 'alchemist', 'oracle', 'journey')),
  add column category_label text,
  add column who_it_is_for text,
  add column approach text,
  add column what_to_expect text,
  add column preparation text,
  add column deliverables text[],
  add column realm_id text,
  add column chakra text,
  add column color text,
  add column is_active boolean not null default true,
  add column is_deleted boolean not null default false;

create or replace function public.sync_service_catalog_schedule_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_minutes integer;
  amount integer;
begin
  -- Use the last number in a displayed range (for example, 15-30 min => 30).
  amount := nullif((regexp_match(lower(new.duration), '(\d+)(?!.*\d)'))[1], '')::integer;
  if amount is null then
    display_minutes := 60;
  elsif lower(new.duration) like '%hour%' or lower(new.duration) like '%hr%' then
    display_minutes := amount * 60;
  else
    display_minutes := amount;
  end if;
  display_minutes := greatest(5, least(display_minutes, 480));

  insert into public.service_schedule_policies(service_slug, duration_minutes, is_bookable)
  values (new.slug, display_minutes, new.is_active and not new.is_deleted)
  on conflict (service_slug) do update
    set duration_minutes = excluded.duration_minutes,
        is_bookable = case
          when tg_op = 'UPDATE' and new.is_active = old.is_active and new.is_deleted = old.is_deleted
            then public.service_schedule_policies.is_bookable
          else excluded.is_bookable
        end;
  return new;
end;
$$;

create trigger service_catalog_schedule_sync
  after insert or update of duration, is_active, is_deleted on public.service_catalog
  for each row execute function public.sync_service_catalog_schedule_policy();

commit;
