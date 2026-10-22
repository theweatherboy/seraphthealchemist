begin;

alter table public.tiktok_live_queue
  add column first_name text,
  add column last_name text,
  add column donated_amount numeric(10,2) check (donated_amount >= 0 and donated_amount <= 99999999.99),
  alter column expected_amount drop not null;

grant update(donated_amount, payment_method) on public.tiktok_live_queue to authenticated;

-- Existing intake and historic offering totals remain intact for older entries.
create function public.join_tiktok_live(
  request_id uuid, first_name text, last_name text, selected_payment text,
  accepted_terms boolean, accepted_privacy boolean, entry_source text default 'visitor'
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  clean_first text := nullif(btrim(first_name), '');
  clean_last text := nullif(btrim(last_name), '');
  full_name text;
  previous public.tiktok_live_queue%rowtype;
begin
  if accepted_terms is distinct from true or accepted_privacy is distinct from true then
    raise exception 'Please acknowledge both policies';
  end if;
  if entry_source is null or entry_source not in ('visitor','admin') or (entry_source = 'admin' and not public.is_sanctuary_admin()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if request_id is null or clean_first is null or clean_last is null
    or char_length(clean_first) > 60 or char_length(clean_last) > 60
    or clean_first ~ '[[:cntrl:]]' or clean_last ~ '[[:cntrl:]]' then
    raise exception 'Enter a valid first and last name';
  end if;
  if selected_payment is null or selected_payment not in ('cash_app','paypal','venmo','stripe') then
    raise exception 'Choose a payment method';
  end if;
  full_name := clean_first || ' ' || clean_last;
  perform pg_advisory_xact_lock(hashtextextended(lower(full_name), 20));
  select * into previous from public.tiktok_live_queue where id = request_id;
  if found then
    -- Retry remains idempotent even after an administrator corrects payment details.
    if previous.first_name = clean_first and previous.last_name = clean_last and previous.source = entry_source
      and (entry_source = 'visitor' or previous.entered_by = auth.uid()) then
      return request_id;
    end if;
    raise exception 'Submission reference already used';
  end if;
  if entry_source = 'visitor' and (select count(*) from public.tiktok_live_queue
    where lower(name) = lower(full_name) and created_at > now() - interval '5 minutes') >= 3 then
    raise exception 'Please wait before submitting another LIVE request';
  end if;
  insert into public.tiktok_live_queue(id,name,first_name,last_name,items,payment_method,terms_version,privacy_version,source,entered_by)
  values(request_id,full_name,clean_first,clean_last,'[]'::jsonb,selected_payment,'2026-09-16','2026-10-12',entry_source,
    case when entry_source = 'admin' then auth.uid() else null end);
  return request_id;
end;
$$;
revoke all on function public.join_tiktok_live(uuid,text,text,text,boolean,boolean,text) from public;
grant execute on function public.join_tiktok_live(uuid,text,text,text,boolean,boolean,text) to anon, authenticated;

commit;
