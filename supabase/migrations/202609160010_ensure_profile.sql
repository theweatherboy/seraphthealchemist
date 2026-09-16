begin;

-- Repair a profile removed manually from an existing auth account. This does
-- not create admin memberships and can only insert the caller's own profile.
create function public.ensure_my_profile()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  insert into public.profiles(id) values (auth.uid()) on conflict (id) do nothing;
end;
$$;
revoke all on function public.ensure_my_profile() from public, anon, authenticated;
grant execute on function public.ensure_my_profile() to authenticated;

commit;
