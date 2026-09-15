begin;

alter table public.service_requests
  add column if not exists payment_status text not null default 'awaiting_verification'
    check (payment_status in ('awaiting_verification', 'verified', 'declined', 'refunded'));

-- Every current offering gets a usable default. Admin can adjust these in
-- Administration → Availability & booking rules.
insert into public.service_schedule_policies (service_slug, duration_minutes)
values
  ('mini-reading', 30), ('elixir-of-self', 60), ('spiritual-session-175', 75),
  ('spiritual-session-222', 90), ('spiritual-session-333', 120),
  ('spiritual-session-444', 150), ('year-ahead', 180), ('journey-to-the-goddesses', 60)
on conflict (service_slug) do nothing;

create function public.available_booking_slots(
  target_service text,
  from_day date default current_date,
  number_of_days integer default 28
)
returns table(slot_start timestamptz, slot_end timestamptz, slot_timezone text)
language plpgsql security definer set search_path = public as $$
declare
  policy_row public.service_schedule_policies%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if number_of_days not between 1 and 56 then raise exception 'invalid booking window'; end if;
  select * into policy_row from public.service_schedule_policies where service_slug = target_service;
  if not found or not policy_row.is_bookable then return; end if;

  return query
  with dates as (
    select generate_series(greatest(from_day, current_date), greatest(from_day, current_date) + (number_of_days - 1), interval '1 day')::date as day
  ), candidates as (
    select
      (candidate_local at time zone availability.timezone) as starts_at,
      ((candidate_local + make_interval(mins => policy_row.duration_minutes + policy_row.buffer_minutes)) at time zone availability.timezone) as ends_at,
      availability.timezone,
      candidate_local
    from dates
    join public.scheduling_availability availability
      on availability.is_enabled and availability.weekday = extract(dow from dates.day)::smallint
    cross join lateral generate_series(
      dates.day + availability.starts_at,
      dates.day + availability.ends_at - make_interval(mins => policy_row.duration_minutes + policy_row.buffer_minutes),
      interval '30 minutes'
    ) as generated(candidate_local)
  )
  select candidates.starts_at, candidates.ends_at, candidates.timezone
  from candidates
  where candidates.candidate_local::date = (candidates.ends_at at time zone candidates.timezone)::date
    and not exists (select 1 from public.scheduling_blocks where tstzrange(starts_at, ends_at, '[)') && tstzrange(candidates.starts_at, candidates.ends_at, '[)'))
    and not exists (select 1 from public.service_requests where status = 'scheduled' and tstzrange(scheduled_at, scheduled_end_at, '[)') && tstzrange(candidates.starts_at, candidates.ends_at, '[)'))
    and (policy_row.max_per_day is null or (select count(*) from public.service_requests where service_slug = target_service and status = 'scheduled' and (scheduled_at at time zone candidates.timezone)::date = candidates.candidate_local::date) < policy_row.max_per_day)
    and (policy_row.max_per_week is null or (select count(*) from public.service_requests where service_slug = target_service and status = 'scheduled' and date_trunc('week', scheduled_at at time zone candidates.timezone) = date_trunc('week', candidates.candidate_local)) < policy_row.max_per_week)
    and (policy_row.max_per_month is null or (select count(*) from public.service_requests where service_slug = target_service and status = 'scheduled' and date_trunc('month', scheduled_at at time zone candidates.timezone) = date_trunc('month', candidates.candidate_local)) < policy_row.max_per_month)
  order by candidates.starts_at;
end;
$$;
revoke all on function public.available_booking_slots(text, date, integer) from public, anon, authenticated;
grant execute on function public.available_booking_slots(text, date, integer) to authenticated;

create function public.book_service_request(
  target_service text,
  target_title text,
  selected_start timestamptz,
  selected_timezone text,
  selected_payment_method text,
  selected_payment_reference text,
  selected_note text default null,
  selected_phone text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  policy_row public.service_schedule_policies%rowtype;
  selected_end timestamptz;
  local_start timestamp without time zone;
  local_end timestamp without time zone;
  request_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if selected_payment_method not in ('cash_app', 'paypal', 'venmo', 'stripe') then raise exception 'invalid payment method'; end if;
  if char_length(btrim(selected_payment_reference)) not between 2 and 120 or selected_payment_reference ~ '[[:cntrl:]]' then raise exception 'invalid payment reference'; end if;
  if selected_note is not null and (char_length(selected_note) > 1000 or selected_note ~ '[[:cntrl:]]') then raise exception 'invalid note'; end if;
  if selected_phone is not null and (char_length(selected_phone) < 7 or char_length(selected_phone) > 40 or selected_phone ~ '[[:cntrl:]]') then raise exception 'invalid phone'; end if;
  select * into policy_row from public.service_schedule_policies where service_slug = target_service;
  if not found or not policy_row.is_bookable then raise exception 'this service is not available'; end if;
  if char_length(btrim(selected_timezone)) not between 3 and 80 or selected_timezone ~ '[[:cntrl:]]' then raise exception 'invalid timezone'; end if;

  selected_end := selected_start + make_interval(mins => policy_row.duration_minutes + policy_row.buffer_minutes);
  local_start := selected_start at time zone selected_timezone;
  local_end := selected_end at time zone selected_timezone;
  if local_start::date <> local_end::date then raise exception 'invalid appointment window'; end if;
  if not exists (
    select 1 from public.scheduling_availability
    where is_enabled and timezone = selected_timezone and weekday = extract(dow from local_start)::smallint
      and starts_at <= local_start::time and ends_at >= local_end::time
  ) then raise exception 'the selected time is unavailable'; end if;
  if exists (select 1 from public.scheduling_blocks where tstzrange(starts_at, ends_at, '[)') && tstzrange(selected_start, selected_end, '[)')) then raise exception 'the selected time is blocked'; end if;
  if policy_row.max_per_day is not null and (select count(*) from public.service_requests where service_slug = target_service and status = 'scheduled' and (scheduled_at at time zone selected_timezone)::date = local_start::date) >= policy_row.max_per_day then raise exception 'daily service limit reached'; end if;
  if policy_row.max_per_week is not null and (select count(*) from public.service_requests where service_slug = target_service and status = 'scheduled' and date_trunc('week', scheduled_at at time zone selected_timezone) = date_trunc('week', local_start)) >= policy_row.max_per_week then raise exception 'weekly service limit reached'; end if;
  if policy_row.max_per_month is not null and (select count(*) from public.service_requests where service_slug = target_service and status = 'scheduled' and date_trunc('month', scheduled_at at time zone selected_timezone) = date_trunc('month', local_start)) >= policy_row.max_per_month then raise exception 'monthly service limit reached'; end if;

  insert into public.service_requests(customer_id, service_slug, service_title, payment_method, payment_reference, payment_status, note, contact_email, contact_phone, preferred_date, preferred_time, timezone, scheduled_at, scheduled_end_at, status)
  values (auth.uid(), target_service, target_title, selected_payment_method, btrim(selected_payment_reference), 'awaiting_verification', nullif(btrim(selected_note), ''), (select email from auth.users where id = auth.uid()), nullif(btrim(selected_phone), ''), local_start::date, local_start::time, selected_timezone, selected_start, selected_end, 'scheduled')
  returning id into request_id;
  return request_id;
end;
$$;
revoke all on function public.book_service_request(text, text, timestamptz, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.book_service_request(text, text, timestamptz, text, text, text, text, text) to authenticated;

drop function public.schedule_service_request(uuid, text, timestamp without time zone, text, text);
create function public.schedule_service_request(
  target_request uuid,
  next_status text,
  scheduled_local timestamp without time zone default null,
  schedule_timezone text default 'America/Chicago',
  next_admin_note text default null,
  next_payment_status text default null
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
  resolved_payment_status text;
begin
  if not public.is_sanctuary_admin() then raise exception 'forbidden'; end if;
  if next_status not in ('pending', 'contacted', 'scheduled', 'completed', 'declined', 'canceled') then raise exception 'invalid scheduling status'; end if;
  if next_payment_status is not null and next_payment_status not in ('awaiting_verification', 'verified', 'declined', 'refunded') then raise exception 'invalid payment status'; end if;
  if char_length(btrim(schedule_timezone)) not between 3 and 80 or schedule_timezone ~ '[[:cntrl:]]' then raise exception 'invalid timezone'; end if;
  select * into request_row from public.service_requests where id = target_request for update;
  if not found then raise exception 'service request not found'; end if;
  resolved_payment_status := coalesce(next_payment_status, request_row.payment_status);

  if next_status <> 'scheduled' then
    update public.service_requests set status = next_status, scheduled_at = null, scheduled_end_at = null, timezone = schedule_timezone, payment_status = resolved_payment_status, admin_note = nullif(btrim(next_admin_note), ''), reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now() where id = target_request;
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
  if exists (select 1 from public.scheduling_blocks where tstzrange(starts_at, ends_at, '[)') && tstzrange(start_at, end_at, '[)')) then raise exception 'that time is blocked'; end if;
  select count(*) into active_rules from public.scheduling_availability where is_enabled and timezone = schedule_timezone;
  if active_rules > 0 then
    select count(*) into matching_rules from public.scheduling_availability where is_enabled and timezone = schedule_timezone and weekday = extract(dow from local_start)::smallint and starts_at <= local_start::time and ends_at >= local_end::time;
    if matching_rules = 0 then raise exception 'that time is outside your availability'; end if;
  end if;
  if has_policy and policy_row.max_per_day is not null then select count(*) into appointment_count from public.service_requests where id <> target_request and service_slug = request_row.service_slug and status = 'scheduled' and (scheduled_at at time zone schedule_timezone)::date = local_day; if appointment_count >= policy_row.max_per_day then raise exception 'daily service limit reached'; end if; end if;
  if has_policy and policy_row.max_per_week is not null then select count(*) into appointment_count from public.service_requests where id <> target_request and service_slug = request_row.service_slug and status = 'scheduled' and date_trunc('week', scheduled_at at time zone schedule_timezone) = date_trunc('week', local_start); if appointment_count >= policy_row.max_per_week then raise exception 'weekly service limit reached'; end if; end if;
  if has_policy and policy_row.max_per_month is not null then select count(*) into appointment_count from public.service_requests where id <> target_request and service_slug = request_row.service_slug and status = 'scheduled' and date_trunc('month', scheduled_at at time zone schedule_timezone) = date_trunc('month', local_start); if appointment_count >= policy_row.max_per_month then raise exception 'monthly service limit reached'; end if; end if;
  update public.service_requests set status = 'scheduled', scheduled_at = start_at, scheduled_end_at = end_at, timezone = schedule_timezone, payment_status = resolved_payment_status, admin_note = nullif(btrim(next_admin_note), ''), reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now() where id = target_request;
end;
$$;
revoke all on function public.schedule_service_request(uuid, text, timestamp without time zone, text, text, text) from public, anon, authenticated;
grant execute on function public.schedule_service_request(uuid, text, timestamp without time zone, text, text, text) to authenticated;

commit;
