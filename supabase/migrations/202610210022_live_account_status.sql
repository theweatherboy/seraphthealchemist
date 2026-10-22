begin;

alter table public.tiktok_live_queue
  add column account_status text not null default 'unknown'
    check (account_status in ('account','guest','manual','unknown')),
  add column account_id uuid references auth.users(id) on delete set null;

-- Existing records cannot reliably be classified retroactively. Capture new
-- submissions from the trusted session, never from browser-supplied identity.
create function public.set_live_account_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.account_id := null;
  if new.source = 'admin' then
    new.account_status := 'manual';
  elsif auth.uid() is not null then
    new.account_status := 'account';
    new.account_id := auth.uid();
  else
    new.account_status := 'guest';
  end if;
  return new;
end;
$$;
revoke all on function public.set_live_account_status() from public, anon, authenticated;
create trigger live_account_status_before_insert
  before insert on public.tiktok_live_queue
  for each row execute function public.set_live_account_status();

-- The existing admin-only SELECT grant and RLS cover these columns. No public
-- reads or client UPDATE grants for account identity are needed.
commit;
