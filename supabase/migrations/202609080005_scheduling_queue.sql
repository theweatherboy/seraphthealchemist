begin;

alter table public.service_requests
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists preferred_date date,
  add column if not exists preferred_time time,
  add column if not exists timezone text not null default 'America/Chicago',
  add column if not exists scheduled_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.service_requests set status = 'scheduled' where status = 'confirmed';
update public.service_requests set status = 'canceled' where status = 'cancelled';
alter table public.service_requests drop constraint if exists service_requests_status_check;
alter table public.service_requests add constraint service_requests_status_check
  check (status in ('pending','contacted','scheduled','completed','declined','canceled'));
alter table public.service_requests add constraint service_requests_contact_email_check
  check (contact_email is null or (char_length(btrim(contact_email)) between 3 and 320 and contact_email !~ '[[:cntrl:]]'));
alter table public.service_requests add constraint service_requests_contact_phone_check
  check (contact_phone is null or (char_length(btrim(contact_phone)) between 7 and 40 and contact_phone !~ '[[:cntrl:]]'));
alter table public.service_requests add constraint service_requests_admin_note_check
  check (admin_note is null or (char_length(admin_note) <= 1000 and admin_note !~ '[[:cntrl:]]'));

create index if not exists service_requests_schedule_idx on public.service_requests(status, preferred_date, preferred_time);
grant update on public.service_requests to authenticated;

drop policy if exists service_requests_admin_update on public.service_requests;
create policy service_requests_admin_update on public.service_requests for update to authenticated
  using (public.is_sanctuary_admin())
  with check (public.is_sanctuary_admin());

commit;
