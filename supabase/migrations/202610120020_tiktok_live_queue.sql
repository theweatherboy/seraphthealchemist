begin;

-- Intentionally independent of service_requests, appointments and calendar tables.
create table public.tiktok_live_queue (
  id uuid primary key,
  name text,
  email text,
  items jsonb not null,
  expected_amount integer not null check (expected_amount > 0),
  payment_method text not null check (payment_method in ('cash_app','paypal','venmo','stripe')),
  payment_reference text,
  status text not null default 'waiting' check (status in ('waiting','completed','removed')),
  payment_status text not null default 'unverified' check (payment_status in ('unverified','verified')),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz not null default now(),
  terms_version text not null,
  privacy_version text not null,
  source text not null check (source in ('visitor','admin')),
  entered_by uuid references auth.users(id),
  check (name is not null or email is not null)
);
create index tiktok_live_queue_status_date on public.tiktok_live_queue(status, created_at);
alter table public.tiktok_live_queue enable row level security;
revoke all on public.tiktok_live_queue from public, anon, authenticated;
grant select on public.tiktok_live_queue to authenticated;
grant update(status, payment_status) on public.tiktok_live_queue to authenticated;
create policy live_admin_read on public.tiktok_live_queue for select to authenticated
  using (public.is_sanctuary_admin());
create policy live_admin_update on public.tiktok_live_queue for update to authenticated
  using (public.is_sanctuary_admin()) with check (public.is_sanctuary_admin());

create function public.submit_tiktok_live(
  request_id uuid, contact_name text, contact_email text, selected_services text[],
  extra_time boolean, selected_payment text, payment_reference text,
  accepted_terms boolean, accepted_privacy boolean, confirmed boolean,
  entry_source text default 'visitor'
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  clean_name text := nullif(btrim(contact_name), '');
  clean_email text := nullif(lower(btrim(contact_email)), '');
  clean_reference text := nullif(btrim(payment_reference), '');
  service_items jsonb;
  donation integer;
  previous public.tiktok_live_queue%rowtype;
begin
  if accepted_terms is distinct from true or accepted_privacy is distinct from true or confirmed is distinct from true then
    raise exception 'Confirm details and acknowledge both policies before submitting';
  end if;
  if entry_source is null or entry_source not in ('visitor','admin') or (entry_source = 'admin' and not public.is_sanctuary_admin()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if request_id is null or (clean_name is null and clean_email is null)
    or char_length(clean_name) > 120 or clean_name ~ '[[:cntrl:]]'
    or char_length(clean_email) > 254 or (clean_email is not null and clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
    or char_length(clean_reference) > 120 or clean_reference ~ '[[:cntrl:]]' then
    raise exception 'Enter a valid name or email and payment reference';
  end if;
  if selected_payment is null or selected_payment not in ('cash_app','paypal','venmo','stripe') then raise exception 'Choose a payment method'; end if;
  if selected_services is null or cardinality(selected_services) not between 1 and 5
    or exists(select 1 from unnest(selected_services) s where s is null or s not in ('guidance','mediumship','energy','chakra','aura'))
    or (select count(distinct s) from unnest(selected_services) s) <> cardinality(selected_services)
    or extra_time is null or (extra_time and not ('guidance' = any(selected_services))) then
    raise exception 'Choose valid LIVE offerings; extra time is for guidance only';
  end if;
  select jsonb_agg(jsonb_build_object('id', id, 'title', title, 'amount', amount) order by position), sum(amount)
  into service_items, donation
  from (values
    ('guidance', 'What do I need to know?', 55, 1),
    ('mediumship', 'Mediumship', 88, 2),
    ('energy', 'Energy healing', 77, 3),
    ('chakra', 'Blockage scan & removal', 55, 4),
    ('aura', 'Aura cleanse & reset', 66, 5)
  ) as catalog(id, title, amount, position) where id = any(selected_services);
  if extra_time then
    service_items := service_items || jsonb_build_array(jsonb_build_object('id','guidance-extra','title','Guidance extra time','amount',11));
    donation := donation + 11;
  end if;
  -- Serialize retries and apply a small per-contact burst limit to public intake.
  perform pg_advisory_xact_lock(hashtextextended(coalesce(clean_email, lower(clean_name)), 20));
  select * into previous from public.tiktok_live_queue where id = request_id;
  if found then
    if previous.name is not distinct from clean_name and previous.email is not distinct from clean_email
      and previous.items = service_items and previous.payment_method = selected_payment
      and previous.payment_reference is not distinct from clean_reference and previous.source = entry_source then
      return request_id;
    end if;
    raise exception 'Submission reference already used';
  end if;
  if entry_source = 'visitor' and (select count(*) from public.tiktok_live_queue
    where coalesce(email, lower(name)) = coalesce(clean_email, lower(clean_name))
    and created_at > now() - interval '5 minutes') >= 3 then
    raise exception 'Please wait before submitting another LIVE request';
  end if;
  insert into public.tiktok_live_queue(id,name,email,items,expected_amount,payment_method,payment_reference,terms_version,privacy_version,source,entered_by)
  values(request_id,clean_name,clean_email,service_items,donation,selected_payment,clean_reference,'2026-09-16','2026-10-12',entry_source,
    case when entry_source = 'admin' then auth.uid() else null end);
  return request_id;
end;
$$;
revoke all on function public.submit_tiktok_live(uuid,text,text,text[],boolean,text,text,boolean,boolean,boolean,text) from public;
grant execute on function public.submit_tiktok_live(uuid,text,text,text[],boolean,text,text,boolean,boolean,boolean,text) to anon, authenticated;

insert into public.navigation_visibility (href, label, sort_order)
values ('/tiktok-live', 'TikTok LIVE', 12)
on conflict (href) do nothing;
commit;
