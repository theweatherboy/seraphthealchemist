import { notFound } from 'next/navigation';
import ServiceEditor from '@/components/admin/ServiceEditor';
import { requireAccount } from '@/lib/supabase/session';
import SubmitButton from '@/components/auth/SubmitButton';
import {
  addAvailabilityWindow,
  addSchedulingBlock,
  addServiceInstance,
  deleteAvailabilityWindow,
  deleteSchedulingBlock,
  moderateReview,
  saveServiceSchedulePolicy,
} from '@/app/admin/actions';
import { getServices } from '@/lib/services';
import type { Database } from '@/lib/supabase/database.types';


const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const localDateTime = (value: string | null, timezone = 'America/Chicago') => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value)) : 'Not scheduled';
const defaultDuration = (duration: string) => {
  if (duration.includes('session')) return 60;
  const amount = Number(duration.match(/\d+/g)?.at(-1) ?? 60);
  return duration.includes('hour') ? amount * 60 : amount;
};

export default async function Management({ searchParams, section }: { searchParams: Promise<{ error?: string; saved?: string }>; section: 'services' | 'testimonies' }) {
  const { client, user } = await requireAccount('/admin');
  const { data, error } = await client.from('admin_memberships').select('user_id').eq('user_id', user.id).maybeSingle();
  if (error || !data) notFound();
  const services = await getServices({ includeInactive: true });
  const catalogResult = await client.from('service_catalog').select('slug').limit(1);
  const params = await searchParams;
  const [profilesResult, reviewsResult, availabilityResult, blocksResult, policiesResult] = await Promise.all([
    client.from('profiles').select('id, display_name').order('display_name'),
    client.from('reviews').select('id, customer_id, service_instance_id, status, created_at').eq('status', 'pending').order('created_at', { ascending: true }),
    client.from('scheduling_availability').select('id, weekday, starts_at, ends_at, timezone, is_enabled').order('weekday').order('starts_at'),
    client.from('scheduling_blocks').select('id, starts_at, ends_at, reason').gte('ends_at', new Date().toISOString()).order('starts_at'),
    client.from('service_schedule_policies').select('service_slug, duration_minutes, buffer_minutes, max_per_day, max_per_week, max_per_month, is_bookable'),
  ]);
  const pendingReviews = reviewsResult.data ?? [];
  const revisionsResult = pendingReviews.length ? await client.from('review_revisions').select('id, review_id, body, created_at').in('review_id', pendingReviews.map(review => review.id)).order('created_at', { ascending: false }) : { data: [] };
  type SchedulePolicy = Pick<Database['public']['Tables']['service_schedule_policies']['Row'], 'service_slug' | 'duration_minutes' | 'buffer_minutes' | 'max_per_day' | 'max_per_week' | 'max_per_month' | 'is_bookable'>;
  const policies = new Map<string, SchedulePolicy>((policiesResult.data ?? []).map(policy => [policy.service_slug, policy]));
  const scheduleUnavailable = availabilityResult.error || blocksResult.error || policiesResult.error;

  return <section className="admin-management"><header className="admin-heading"><p className="eyebrow">Sanctuary administration</p><h1>{section === 'services' ? 'Availability & Services' : 'Testimonies'}</h1><p>{section === 'services' ? 'Make space for your work. Set your hours, service lengths, and booking limits.' : 'Confirm completed sessions and review the words your clients share.'}</p></header>{params.error && <p role="alert" className="admin-notice">The change could not be saved. Check the details and try again.</p>}{params.saved && <p role="status" className="admin-notice">Your changes have been saved.</p>}<div className="admin-management-body">{section === 'services' ? <><ServiceEditor services={services} available={!catalogResult.error} />    <div className="account-next"><h2>Availability & booking rules</h2><p className="account-fine-print">These rules are applied when you schedule a confirmed appointment. A scheduled service cannot overlap another, fall inside a block, or exceed its service limit.</p>
      {scheduleUnavailable ? <p role="alert">Apply the availability migration before configuring booking rules.</p> : <>
        <div className="account-next"><h3>Weekly availability</h3><p className="account-fine-print">Add one or more windows for each day. Times use the selected sanctuary timezone.</p>
          <form action={addAvailabilityWindow} className="account-form"><label htmlFor="availability-day">Day</label><select id="availability-day" name="weekday" defaultValue="1">{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select><label htmlFor="availability-start">Start</label><input id="availability-start" name="starts_at" type="time" required /><label htmlFor="availability-end">End</label><input id="availability-end" name="ends_at" type="time" required /><label htmlFor="availability-timezone">Sanctuary timezone</label><input id="availability-timezone" name="timezone" defaultValue="America/Chicago" required /><SubmitButton pendingLabel="Saving…">Add availability window</SubmitButton></form>
          {(availabilityResult.data ?? []).length ? <div className="eligible-services">{(availabilityResult.data ?? []).map(window => <div key={window.id}><span><strong>{weekdays[window.weekday]}</strong><small>{window.starts_at.slice(0, 5)}–{window.ends_at.slice(0, 5)} · {window.timezone}</small></span><form action={deleteAvailabilityWindow}><input type="hidden" name="availability_id" value={window.id} /><button type="submit">Remove</button></form></div>)}</div> : <p>No weekly availability has been added yet. Add a window so customers can choose appointment times.</p>}
        </div>
        <div className="account-next"><h3>Unavailable time</h3><p className="account-fine-print">Use this for travel, days off, rituals, or any time that must not be booked.</p><form action={addSchedulingBlock} className="account-form"><label htmlFor="block-start">Starts</label><input id="block-start" name="starts_at" type="datetime-local" required /><label htmlFor="block-end">Ends</label><input id="block-end" name="ends_at" type="datetime-local" required /><label htmlFor="block-timezone">Sanctuary timezone</label><input id="block-timezone" name="timezone" defaultValue="America/Chicago" required /><label htmlFor="block-reason">Reason</label><input id="block-reason" name="reason" defaultValue="Unavailable" maxLength={200} required /><SubmitButton pendingLabel="Saving…">Block time</SubmitButton></form>
          {(blocksResult.data ?? []).length ? <div className="eligible-services">{(blocksResult.data ?? []).map(block => <div key={block.id}><span><strong>{block.reason}</strong><small>{localDateTime(block.starts_at)} – {localDateTime(block.ends_at)}</small></span><form action={deleteSchedulingBlock}><input type="hidden" name="block_id" value={block.id} /><button type="submit">Remove</button></form></div>)}</div> : <p>No upcoming blocked time.</p>}
        </div>
        <div className="account-next"><h3>Service limits</h3><p className="account-fine-print">Set the appointment length, buffer, and optional caps for every published offering. Leaving a cap empty means no cap for that period.</p>{services.map(service => { const policy = policies.get(service.slug); return <details className="review-entry" key={service.slug}><summary><strong>{service.title}</strong> · {policy ? `${policy.duration_minutes} min` : `${defaultDuration(service.duration)} min default`}</summary><form action={saveServiceSchedulePolicy} className="account-form"><input type="hidden" name="service_slug" value={service.slug} /><label htmlFor={`duration-${service.slug}`}>Appointment length (minutes)</label><input id={`duration-${service.slug}`} name="duration_minutes" type="number" min="5" max="480" defaultValue={policy?.duration_minutes ?? defaultDuration(service.duration)} required /><label htmlFor={`buffer-${service.slug}`}>Buffer after appointment (minutes)</label><input id={`buffer-${service.slug}`} name="buffer_minutes" type="number" min="0" max="180" defaultValue={policy?.buffer_minutes ?? 0} required /><label htmlFor={`day-${service.slug}`}>Maximum per day</label><input id={`day-${service.slug}`} name="max_per_day" type="number" min="1" max="100" defaultValue={policy?.max_per_day ?? ''} /><label htmlFor={`week-${service.slug}`}>Maximum per week</label><input id={`week-${service.slug}`} name="max_per_week" type="number" min="1" max="500" defaultValue={policy?.max_per_week ?? ''} /><label htmlFor={`month-${service.slug}`}>Maximum per month</label><input id={`month-${service.slug}`} name="max_per_month" type="number" min="1" max="2000" defaultValue={policy?.max_per_month ?? ''} /><label className="account-check"><input name="is_bookable" type="checkbox" defaultChecked={policy?.is_bookable ?? true} /> Available to schedule</label><SubmitButton pendingLabel="Saving…">Save rules</SubmitButton></form></details>; })}</div>
      </>}
    </div>

</> : <>    <div className="account-next"><h2>Verify a completed service</h2><p>For past sessions, ask your client to sign in at /login and share their account ID from My account. Select that member, the service, and its original completion date. They can then return to My account to submit a testimony; no new booking or payment is needed.</p>{profilesResult.error && <p role="alert">The client list could not be loaded. Please reload before confirming a service.</p>}<form action={addServiceInstance} className="account-form"><label htmlFor="customer-id">Customer</label><select id="customer-id" name="customer_id" required><option value="">Choose a member</option>{(profilesResult.data ?? []).map(profile => <option value={profile.id} key={profile.id}>{profile.display_name} ({profile.id.slice(0, 8)})</option>)}</select><label htmlFor="service-slug">Published offering</label><select id="service-slug" name="service_slug" required><option value="">Choose an offering</option>{services.map(service => <option value={service.slug} key={service.slug}>{service.title}</option>)}</select><label htmlFor="completed-at">Completed on</label><input id="completed-at" name="completed_at" type="date" required /><SubmitButton pendingLabel="Saving…">Confirm service</SubmitButton></form></div>
    <div className="account-next"><h2>Testimonies awaiting review</h2>{reviewsResult.error ? <p role="alert">The review queue could not be loaded.</p> : pendingReviews.length ? pendingReviews.map(review => { const revision = (revisionsResult.data ?? []).find(item => item.review_id === review.id); return <article className="review-entry" key={review.id}><h3>Pending testimony</h3><p>{revision?.body ?? 'Revision unavailable'}</p><form action={moderateReview} className="account-links"><input type="hidden" name="review_id" value={review.id} /><input type="hidden" name="revision_id" value={revision?.id ?? ''} /><button name="decision" value="approved" type="submit">Publish</button><button name="decision" value="rejected">Reject</button></form></article>; }) : <p>No pending testimonies.</p>}</div>
</>}</div></section>;
}
