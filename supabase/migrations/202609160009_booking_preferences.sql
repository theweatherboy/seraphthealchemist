begin;

alter table public.service_requests
  add column ai_notes_opt_in boolean not null default false,
  add column recording_opt_in boolean not null default false,
  add column marketing_email_opt_in boolean not null default false,
  add column marketing_sms_opt_in boolean not null default false,
  add column preferences_recorded_at timestamptz,
  add column preferences_version text;

-- Book and record the customer's choices in one transaction. Legacy bookings
-- have no consent; existing clients are never enrolled by this migration.
create function public.book_service_request_with_preferences(
  target_service text,
  target_title text,
  selected_start timestamptz,
  selected_timezone text,
  selected_payment_method text,
  selected_payment_reference text,
  selected_note text default null,
  selected_phone text default null,
  allow_recording boolean default false,
  allow_ai_notes boolean default false,
  allow_marketing_email boolean default false,
  allow_marketing_sms boolean default false
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  request_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if allow_marketing_sms and (selected_phone is null or char_length(regexp_replace(selected_phone, '[^0-9]', '', 'g')) not between 7 and 15) then
    raise exception 'a phone number is required for text message consent';
  end if;
  request_id := public.book_service_request(target_service, target_title, selected_start, selected_timezone,
    selected_payment_method, selected_payment_reference, selected_note, selected_phone);
  update public.service_requests set
    ai_notes_opt_in = coalesce(allow_ai_notes, false),
    recording_opt_in = coalesce(allow_recording, false),
    marketing_email_opt_in = coalesce(allow_marketing_email, false),
    marketing_sms_opt_in = coalesce(allow_marketing_sms, false),
    preferences_recorded_at = now(), preferences_version = '2026-09-16'
  where id = request_id and customer_id = auth.uid();
  return request_id;
end;
$$;
revoke all on function public.book_service_request_with_preferences(text,text,timestamptz,text,text,text,text,text,boolean,boolean,boolean,boolean) from public, anon, authenticated;
grant execute on function public.book_service_request_with_preferences(text,text,timestamptz,text,text,text,text,text,boolean,boolean,boolean,boolean) to authenticated;

-- Customers can withdraw their marketing permission across existing bookings.
-- This does not affect appointment communications or an existing reservation.
create function public.withdraw_marketing_consent()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  update public.service_requests set marketing_email_opt_in = false, marketing_sms_opt_in = false
  where customer_id = auth.uid();
end;
$$;
revoke all on function public.withdraw_marketing_consent() from public, anon, authenticated;
grant execute on function public.withdraw_marketing_consent() to authenticated;

commit;
