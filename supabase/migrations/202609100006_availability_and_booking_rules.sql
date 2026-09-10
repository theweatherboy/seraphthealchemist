begin;

-- The schedule is stored in one canonical place. Calendar providers mirror these
-- confirmed appointments; they never decide what is available.
alter table public.service_requests
  add column if not exists scheduled_end_at timestamptz;

update public.service_requests
  set scheduled_end_at = scheduled_at + interval '60 minutes'
  where status = 'scheduled' and scheduled_at is not null and scheduled_end_at is null;

alter table public.service_requests drop constraint if exists service_requests_scheduled_window_check;
alter table public.service_requests add constraint service_requests_scheduled_window_check
  check (
    (scheduled_at is null and scheduled_end_at is null)
    or (scheduled_at is not null and scheduled_end_at is not null and scheduled_end_at > scheduled_at)
  );

create extension if not exists btree_gist;
alter table public.service_requests drop constraint if exists service_requests_no_overlapping_appointments;
alter table public.service_requests add constraint service_requests_no_overlapping_appointments
  exclude using gist (tstzrange(scheduled_at, scheduled_end_at, '[)') with &&)
  where (status = 'scheduled' and scheduled_at is not null and scheduled_end_at is not null);

create table public.scheduling_availability (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'America/Chicago' check (char_length(btrim(timezone)) between 3 and 80 and timezone !~ '[[:cntrl:]]'),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (weekday, starts_at, ends_at, timezone)
);

create table public.scheduling_blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default 'Unavailable' check (char_length(btrim(reason)) between 2 and 200 and reason !~ '[[:cntrl:]]'),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index scheduling_blocks_window_idx on public.scheduling_blocks(starts_at, ends_at);

create table public.service_schedule_policies (
  service_slug text primary key check (char_length(btrim(service_slug)) between 2 and 120 and service_slug !~ '[[:cntrl:]]'),
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  buffer_minutes integer not null default 0 check (buffer_minutes between 0 and 180),
  max_per_day integer check (max_per_day between 1 and 100),
  max_per_week integer check (max_per_week between 1 and 500),
  max_per_month integer check (max_per_month between 1 and 2000),
  is_bookable boolean not null default true,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.scheduling_availability enable row level security;
alter table public.scheduling_blocks enable row level security;
alter table public.service_schedule_policies enable row level security;
revoke all on public.scheduling_availability, public.scheduling_blocks, public.service_schedule_policies from public, anon, authenticated;
grant select, insert, update, delete on public.scheduling_availability, public.scheduling_blocks, public.service_schedule_policies to authenticated;

create policy scheduling_availability_admin on public.scheduling_availability for all to authenticated
  using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());
create policy scheduling_blocks_admin on public.scheduling_blocks for all to authenticated
  using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());
create policy service_schedule_policies_admin on public.service_schedule_policies for all to authenticated
  using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());

create function public.stamp_schedule_row()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.stamp_schedule_row() from public, anon, authenticated;

create trigger scheduling_availability_before_update before update on public.scheduling_availability
  for each row execute function public.stamp_schedule_row();
create trigger service_schedule_policies_before_update before update on public.service_schedule_policies
  for each row execute function public.stamp_schedule_row();

create function public.create_scheduling_block(
  starts_local timestamp without time zone,
  ends_local timestamp without time zone,
  schedule_timezone text,
  block_reason text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  block_id uuid;
begin
  if not public.is_sanctuary_admin() then raise exception 'forbidden'; end if;
  if starts_local is null or ends_local is null or ends_local <= starts_local then raise exception 'invalid block window'; end if;
  if char_length(btrim(schedule_timezone)) not between 3 and 80 or schedule_timezone ~ '[[:cntrl:]]' then raise exception 'invalid timezone'; end if;
  if char_length(btrim(block_reason)) not between 2 and 200 or block_reason ~ '[[:cntrl:]]' then raise exception 'invalid block reason'; end if;
  insert into public.scheduling_blocks(starts_at, ends_at, reason, created_by)
    values (starts_local at time zone schedule_timezone, ends_local at time zone schedule_timezone, btrim(block_reason), auth.uid())
    returning id into block_id;
  return block_id;
end;
$$;
revoke all on function public.create_scheduling_block(timestamp without time zone, timestamp without time zone, text, text) from public, anon, authenticated;
grant execute on function public.create_scheduling_block(timestamp without time zone, timestamp without time zone, text, text) to authenticated;

create function public.schedule_service_request(
  target_request uuid,
  next_status text,
  scheduled_local timestamp without time zone default null,
  schedule_timezone text default 'America/Chicago',
  next_admin_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  request_row public.service_requests%rowtype;
  policy_row public.service_schedule_policies%rowtype;
  start_at timestamptz;
  end_at timestamptz;
  local_start timestamp without time zone;
  local_end timestamp without time zone;
  local_day date;
  active_rules integer;
  matching_rules integer;
  appointment_count integer;
  has_policy boolean := false;
begin
  if not public.is_sanctuary_admin() then raise exception 'forbidden'; end if;
  if next_status not in ('pending', 'contacted', 'scheduled', 'completed', 'declined', 'canceled') then
    raise exception 'invalid scheduling status';
  end if;
  if char_length(btrim(schedule_timezone)) not between 3 and 80 or schedule_timezone ~ '[[:cntrl:]]' then
    raise exception 'invalid timezone';
  end if;
  if next_admin_note is not null and (char_length(next_admin_note) > 1000 or next_admin_note ~ '[[:cntrl:]]') then
    raise exception 'invalid admin note';
  end if;

  select * into request_row from public.service_requests where id = target_request for update;
  if not found then raise exception 'service request not found'; end if;

  if next_status <> 'scheduled' then
    update public.service_requests
      set status = next_status, scheduled_at = null, scheduled_end_at = null,
          timezone = schedule_timezone, admin_note = nullif(btrim(next_admin_note), ''),
          reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
      where id = target_request;
    return;
  end if;

  if scheduled_local is null then raise exception 'a date and time are required to schedule an appointment'; end if;
  select * into policy_row from public.service_schedule_policies where service_slug = request_row.service_slug;
  has_policy := found;
  if has_policy and not policy_row.is_bookable then raise exception 'this service is not currently bookable'; end if;

  start_at := scheduled_local at time zone schedule_timezone;
  end_at := start_at + make_interval(mins => coalesce(policy_row.duration_minutes, 60) + coalesce(policy_row.buffer_minutes, 0));
  local_start := start_at at time zone schedule_timezone;
  local_end := end_at at time zone schedule_timezone;
  local_day := local_start::date;
  if local_start::date <> local_end::date then raise exception 'appointments cannot cross into the next day'; end if;

  if exists (
    select 1 from public.scheduling_blocks
    where tstzrange(starts_at, ends_at, '[)') && tstzrange(start_at, end_at, '[)')
  ) then raise exception 'that time is blocked'; end if;

  select count(*) into active_rules from public.scheduling_availability where is_enabled and timezone = schedule_timezone;
  if active_rules > 0 then
    select count(*) into matching_rules from public.scheduling_availability
      where is_enabled and timezone = schedule_timezone
        and weekday = extract(dow from local_start)::smallint
        and starts_at <= local_start::time and ends_at >= local_end::time;
    if matching_rules = 0 then raise exception 'that time is outside your availability'; end if;
  end if;

  if has_policy and policy_row.max_per_day is not null then
    select count(*) into appointment_count from public.service_requests
      where id <> target_request and service_slug = request_row.service_slug and status = 'scheduled'
        and (scheduled_at at time zone schedule_timezone)::date = local_day;
    if appointment_count >= policy_row.max_per_day then raise exception 'daily service limit reached'; end if;
  end if;
  if has_policy and policy_row.max_per_week is not null then
    select count(*) into appointment_count from public.service_requests
      where id <> target_request and service_slug = request_row.service_slug and status = 'scheduled'
        and date_trunc('week', scheduled_at at time zone schedule_timezone) = date_trunc('week', local_start);
    if appointment_count >= policy_row.max_per_week then raise exception 'weekly service limit reached'; end if;
  end if;
  if has_policy and policy_row.max_per_month is not null then
    select count(*) into appointment_count from public.service_requests
      where id <> target_request and service_slug = request_row.service_slug and status = 'scheduled'
        and date_trunc('month', scheduled_at at time zone schedule_timezone) = date_trunc('month', local_start);
    if appointment_count >= policy_row.max_per_month then raise exception 'monthly service limit reached'; end if;
  end if;

  update public.service_requests
    set status = 'scheduled', scheduled_at = start_at, scheduled_end_at = end_at,
        timezone = schedule_timezone, admin_note = nullif(btrim(next_admin_note), ''),
        reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
    where id = target_request;
end;
$$;
revoke all on function public.schedule_service_request(uuid, text, timestamp without time zone, text, text) from public, anon, authenticated;
grant execute on function public.schedule_service_request(uuid, text, timestamp without time zone, text, text) to authenticated;

revoke update on public.service_requests from authenticated;

commit;
