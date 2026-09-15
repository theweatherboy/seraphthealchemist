import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SubmitButton from '@/components/auth/SubmitButton';
import { requireAccount } from '@/lib/supabase/session';
import { updateServiceRequest } from '../actions';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Scheduling queue | Seraph, The Alchemist', robots: { index: false, follow: false } };

type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];

const localDateTime = (value: string | null, timezone = 'America/Chicago') => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value)) : 'Not scheduled';
const titleCase = (value: string) => value.replaceAll('_', ' ');

function queueStatus(request: ServiceRequest) {
  if (request.payment_status === 'awaiting_verification') return { label: 'Needs payment', tone: 'needs-payment' };
  if (request.status === 'completed') return { label: 'Completed', tone: 'completed' };
  if (request.status === 'canceled' || request.status === 'declined') return { label: titleCase(request.status), tone: 'closed' };
  return { label: 'Ready to schedule', tone: 'ready' };
}

export default async function SchedulingPage({ searchParams }: { searchParams: Promise<{ request?: string; error?: string; saved?: string }> }) {
  const { client, user } = await requireAccount('/admin');
  const { data: membership, error: membershipError } = await client.from('admin_memberships').select('user_id').eq('user_id', user.id).maybeSingle();
  if (membershipError || !membership) notFound();

  const [params, requestsResult] = await Promise.all([
    searchParams,
    client.from('service_requests').select('id, customer_id, service_title, service_slug, payment_method, payment_reference, payment_status, contact_email, contact_phone, preferred_date, preferred_time, timezone, scheduled_at, scheduled_end_at, status, note, admin_note, reviewed_by, reviewed_at, updated_at, created_at').order('scheduled_at', { ascending: true, nullsFirst: false }),
  ]);
  const requests = requestsResult.data ?? [];
  const selected = requests.find(request => request.id === params.request) ?? requests.find(request => request.payment_status === 'awaiting_verification') ?? requests[0];
  const needsPayment = requests.filter(request => request.payment_status === 'awaiting_verification').length;
  const ready = requests.filter(request => request.payment_status === 'verified' && request.status !== 'completed').length;

  return <section className="scheduling-page">
    <header className="scheduling-header"><div><p className="eyebrow">Sanctuary administration</p><h1>Scheduling queue</h1><p>Review payment, confirm the reserved time, and keep every session in one focused workspace.</p></div><Link className="scheduling-back" href="/admin">Back to administration</Link></header>
    {params.error && <p role="alert" className="account-notice">The request could not be saved. Check the appointment time and try again.</p>}
    {params.saved && <p role="status" className="account-notice">The request has been saved.</p>}
    {requestsResult.error ? <p role="alert" className="account-notice">The scheduling queue could not be loaded. Confirm the scheduling migrations are applied.</p> : <>
      <div className="queue-summary"><span><strong>{requests.length}</strong> All requests</span><span><strong>{needsPayment}</strong> Needs payment</span><span><strong>{ready}</strong> Ready to schedule</span></div>
      {selected ? <div className="scheduling-workspace">
        <nav className="queue-list" aria-label="Service requests"><h2>Requests</h2>{requests.map(request => { const status = queueStatus(request); const active = request.id === selected.id; return <Link className={`queue-row ${active ? 'is-selected' : ''}`} href={`/admin/scheduling?request=${request.id}`} key={request.id}><span><strong>{request.contact_email ?? 'Sanctuary client'}</strong><small>{request.service_title}</small><small>{localDateTime(request.scheduled_at, request.timezone)}</small></span><em className={`queue-status ${status.tone}`}>{status.label}</em></Link>; })}</nav>
        <article className="queue-detail"><div className="queue-detail-title"><div><p className="eyebrow">Selected reservation</p><h2>{selected.service_title}</h2><p>{selected.contact_email ?? 'Email unavailable'}{selected.contact_phone && ` · ${selected.contact_phone}`}</p></div><span className={`queue-status ${queueStatus(selected).tone}`}>{queueStatus(selected).label}</span></div>
          <dl className="queue-facts"><div><dt>Reserved time</dt><dd>{localDateTime(selected.scheduled_at, selected.timezone)}</dd></div><div><dt>Timezone</dt><dd>{selected.timezone}</dd></div><div><dt>Payment method</dt><dd>{titleCase(selected.payment_method)}</dd></div><div><dt>Payment reference</dt><dd>{selected.payment_reference}</dd></div>{selected.note && <div><dt>Client note</dt><dd>{selected.note}</dd></div>}{selected.admin_note && <div><dt>Admin note</dt><dd>{selected.admin_note}</dd></div>}</dl>
          <form action={updateServiceRequest} className="account-form queue-form"><input type="hidden" name="request_id" value={selected.id} /><input type="hidden" name="return_to" value={`/admin/scheduling?request=${selected.id}`} /><label htmlFor="queue-payment-status">Payment status</label><select id="queue-payment-status" name="payment_status" defaultValue={selected.payment_status}><option value="awaiting_verification">Awaiting verification</option><option value="verified">Verified</option><option value="declined">Declined</option><option value="refunded">Refunded</option></select><label htmlFor="queue-status">Appointment status</label><select id="queue-status" name="status" defaultValue={selected.status}><option value="scheduled">Reserved / scheduled</option><option value="contacted">Contacted</option><option value="completed">Completed</option><option value="canceled">Canceled</option><option value="declined">Declined</option></select><label htmlFor="queue-date">Appointment date</label><input id="queue-date" name="scheduled_date" type="date" defaultValue={selected.scheduled_at ? new Intl.DateTimeFormat('en-CA', { timeZone: selected.timezone }).format(new Date(selected.scheduled_at)) : ''} /><label htmlFor="queue-time">Appointment time</label><input id="queue-time" name="scheduled_time" type="time" defaultValue={selected.scheduled_at ? new Intl.DateTimeFormat('en-GB', { timeZone: selected.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(selected.scheduled_at)) : ''} /><label htmlFor="queue-timezone">Sanctuary timezone</label><input id="queue-timezone" name="timezone" defaultValue={selected.timezone} maxLength={80} /><label htmlFor="queue-note">Private admin note</label><textarea id="queue-note" name="admin_note" defaultValue={selected.admin_note ?? ''} maxLength={1000} /><SubmitButton pendingLabel="Saving…">Save reservation</SubmitButton></form>
        </article>
      </div> : <div className="reviews-empty"><p>No reservations yet. New customer reservations will appear here automatically.</p></div>}</>}
  </section>;
}
