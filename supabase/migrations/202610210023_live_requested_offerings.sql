begin;

alter table public.tiktok_live_queue
  add column requested_offerings text[] not null default '{}'
    check (requested_offerings <@ array['tarot_oracle','healing','cleanse','psychic','mediumship']::text[]
      and array_position(requested_offerings, null) is null
      and cardinality(requested_offerings) <= 5);

create function public.join_tiktok_live_offerings(
  request_id uuid, first_name text, last_name text, selected_payment text,
  accepted_terms boolean, accepted_privacy boolean, selected_offerings text[],
  entry_source text default 'visitor'
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  previous_offerings text[];
  existed boolean;
  saved_id uuid;
begin
  if selected_offerings is null or cardinality(selected_offerings) > 5
    or exists(select 1 from unnest(selected_offerings) s where s is null or s not in ('tarot_oracle','healing','cleanse','psychic','mediumship'))
    or (select count(distinct s) from unnest(selected_offerings) s) <> cardinality(selected_offerings) then
    raise exception 'Choose valid LIVE offerings';
  end if;
  -- Serialize retries before checking the immutable submitted selections.
  perform pg_advisory_xact_lock(hashtextextended(request_id::text, 23));
  select q.requested_offerings into previous_offerings from public.tiktok_live_queue q where q.id = request_id;
  existed := found;
  -- Reuse consent, identity, admin authorization, rate limiting, and account capture.
  saved_id := public.join_tiktok_live(request_id,first_name,last_name,selected_payment,accepted_terms,accepted_privacy,entry_source);
  if existed then
    if not (previous_offerings @> selected_offerings and previous_offerings <@ selected_offerings) then
      raise exception 'Submission reference already used with different offerings';
    end if;
  else
    update public.tiktok_live_queue q set requested_offerings = selected_offerings where q.id = saved_id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.join_tiktok_live_offerings(uuid,text,text,text,boolean,boolean,text[],text) from public;
grant execute on function public.join_tiktok_live_offerings(uuid,text,text,text,boolean,boolean,text[],text) to anon, authenticated;
-- Existing admin-only SELECT privileges and RLS cover the new column.
-- Public visitors have RPC access only; no direct table grants are added.
commit;
