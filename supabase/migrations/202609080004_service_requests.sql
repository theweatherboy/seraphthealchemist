begin;

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_slug text not null,
  service_title text not null,
  payment_method text not null check (payment_method in ('cash_app','paypal','venmo','stripe')),
  payment_reference text not null check (char_length(btrim(payment_reference)) between 2 and 120 and payment_reference !~ '[[:cntrl:]]'),
  note text check (note is null or (char_length(note) <= 1000 and note !~ '[[:cntrl:]]')),
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled')),
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index service_requests_queue_idx on public.service_requests(status, created_at);
alter table public.service_requests enable row level security;
revoke all on public.service_requests from public, anon, authenticated;
grant select, insert on public.service_requests to authenticated;

create policy service_requests_owner_read on public.service_requests for select to authenticated
  using (customer_id = (select auth.uid()) or public.is_sanctuary_admin());
create policy service_requests_owner_insert on public.service_requests for insert to authenticated
  with check (customer_id = (select auth.uid()) and status = 'pending');

commit;
