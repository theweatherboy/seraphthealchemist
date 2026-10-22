begin;

alter table public.tiktok_live_queue
  add column birth_date date check (birth_date >= date '1900-01-01'),
  add column birth_time time without time zone,
  add column birth_place jsonb;

create function public.join_tiktok_live_details(
  request_id uuid, first_name text, last_name text, selected_payment text,
  accepted_terms boolean, accepted_privacy boolean, selected_offerings text[],
  birth_details jsonb, entry_source text default 'visitor'
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  clean_date date;
  clean_time time;
  clean_place jsonb;
  date_text text := nullif(birth_details->>'date', '');
  time_text text := nullif(birth_details->>'time', '');
  previous public.tiktok_live_queue%rowtype;
  existed boolean;
  saved_id uuid;
begin
  if birth_details is null or jsonb_typeof(birth_details) <> 'object' then raise exception 'Invalid birth details'; end if;
  if date_text is not null then
    if date_text !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid birth date'; end if;
    clean_date := date_text::date;
    if clean_date < date '1900-01-01' or clean_date > current_date then raise exception 'Invalid birth date'; end if;
  end if;
  if time_text is not null then
    if time_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Invalid birth time'; end if;
    clean_time := time_text::time;
  end if;
  clean_place := nullif(birth_details->'place', 'null'::jsonb);
  if clean_place is not null then
    if jsonb_typeof(clean_place) <> 'object'
      or jsonb_typeof(clean_place->'label') is distinct from 'string'
      or nullif(btrim(clean_place->>'label'), '') is null
      or char_length(clean_place->>'label') > 300 or clean_place->>'label' ~ '[[:cntrl:]]'
      or jsonb_typeof(clean_place->'lat') is distinct from 'number'
      or jsonb_typeof(clean_place->'lon') is distinct from 'number' then raise exception 'Invalid birthplace'; end if;
    if abs((clean_place->>'lat')::numeric) > 90 or abs((clean_place->>'lon')::numeric) > 180 then raise exception 'Invalid birthplace'; end if;
    clean_place := jsonb_build_object('label', btrim(clean_place->>'label'), 'lat', clean_place->'lat', 'lon', clean_place->'lon');
  end if;
  perform pg_advisory_xact_lock(hashtextextended(request_id::text, 23));
  select * into previous from public.tiktok_live_queue q where q.id = request_id;
  existed := found;
  saved_id := public.join_tiktok_live_offerings(request_id,first_name,last_name,selected_payment,accepted_terms,accepted_privacy,selected_offerings,entry_source);
  if existed then
    if previous.birth_date is distinct from clean_date or previous.birth_time is distinct from clean_time or previous.birth_place is distinct from clean_place then
      raise exception 'Submission reference already used with different birth details';
    end if;
  else
    update public.tiktok_live_queue q set birth_date = clean_date, birth_time = clean_time, birth_place = clean_place, privacy_version = '2026-10-21' where q.id = saved_id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.join_tiktok_live_details(uuid,text,text,text,boolean,boolean,text[],jsonb,text) from public;
grant execute on function public.join_tiktok_live_details(uuid,text,text,text,boolean,boolean,text[],jsonb,text) to anon, authenticated;
-- Existing admin-only SELECT grants and RLS protect birth details. No direct
-- public reads/writes or admin UPDATE privileges for these fields are added.
commit;
