begin;

-- A deliberately narrow public projection. The owner resolves the private join;
-- visitors receive only the service title for an approved, non-revoked review.
create or replace view public.public_review_services
with (security_barrier = true, security_invoker = false) as
select r.id as review_id, s.service_title
from public.reviews r
join public.service_instances s on s.id = r.service_instance_id
where r.status = 'approved' and s.revoked_at is null;

revoke all on public.public_review_services from public, anon, authenticated;
grant select on public.public_review_services to anon, authenticated;

notify pgrst, 'reload schema';
commit;
