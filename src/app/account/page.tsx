import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAccount } from '@/lib/supabase/session';
import SubmitButton from '@/components/auth/SubmitButton';
import BookingForm from '@/components/account/BookingForm';
import { signOut } from '@/app/login/actions';
import { updateProfile } from './actions';
import { withdrawMarketingConsent } from './request-actions';
import { submitReview } from './review-actions';
import { getServices } from '@/lib/services';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My account | Seraph, The Alchemist', robots: { index: false, follow: false } };

const appointmentTime = (value: string, timezone: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value));

const calendarUrl = (request: { service_title: string; scheduled_at: string | null; scheduled_end_at: string | null; timezone: string }) => {
  if (!request.scheduled_at || !request.scheduled_end_at) return null;
  const toCalendarTime = (value: string) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const query = new URLSearchParams({ action: 'TEMPLATE', text: request.service_title, dates: `${toCalendarTime(request.scheduled_at)}/${toCalendarTime(request.scheduled_end_at)}`, ctz: request.timezone, details: 'Reserved with Seraph, The Alchemist. Payment is awaiting verification.' });
  return `https://calendar.google.com/calendar/render?${query}`;
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; request?: string; payment?: string }> }) {
  const { client, user } = await requireAccount();
  const services = await getServices();
  const [params, profileResult, adminResult, instancesResult, reviewsResult, requestsResult] = await Promise.all([
    searchParams,
    client.from('profiles').select('display_name, public_id').eq('id', user.id).maybeSingle(),
    client.from('admin_memberships').select('user_id').eq('user_id', user.id).maybeSingle(),
    client.from('service_instances').select('id, service_title, completed_at').eq('customer_id', user.id).is('revoked_at', null).order('completed_at', { ascending: false }),
    client.from('reviews').select('id, service_instance_id, status').eq('customer_id', user.id).order('created_at', { ascending: false }),
    client.from('service_requests').select('id, service_title, payment_method, payment_reference, payment_status, status, note, contact_phone, timezone, scheduled_at, scheduled_end_at, recording_opt_in, ai_notes_opt_in, marketing_email_opt_in, marketing_sms_opt_in').eq('customer_id', user.id).order('created_at', { ascending: false }),
  ]);
  const profile = profileResult.data;
  const errors: Record<string, string> = { phone: 'Enter a valid phone number to opt in to marketing texts, or leave the text permission unchecked.', preferences: 'Your marketing preferences could not be updated. Please try again or contact Seraph.', name: 'Choose a name between 2 and 60 characters.', save: 'Your name could not be saved.', review: 'Please write 20–1,600 characters.', request: 'We could not reserve that appointment. The time may have just become unavailable; choose another open time and try again.' };
  const reviews = reviewsResult.data ?? [];

  return <section className="account-page"><div className="account-panel">
    <p className="eyebrow">Your sanctuary</p><h1>My account</h1><p>Signed in as <strong>{user.email}</strong>. This email is private.</p><p className="account-fine-print">For a past session, share your account ID with Seraph so the service can be confirmed: <code>{user.id}</code></p>
    {params.error && <p role="alert" className="account-notice">{errors[params.error] ?? 'Something went wrong. Please try again.'}</p>}
    {params.saved === '1' && <p role="status" className="account-notice">Your display name has been saved.</p>}
    {params.saved === 'review' && <p role="status" className="account-notice">Your testimony was submitted for review.</p>}
    {params.saved === 'preferences' && <p role="status" className="account-notice">Marketing email and text permission has been withdrawn for your existing bookings.</p>}
    {params.saved === 'request' && <p role="status" className="account-notice">Your appointment time is reserved. Seraph will verify payment and send confirmation details.</p>}

    {profile ? <form action={updateProfile} className="account-form"><label htmlFor="display-name">Public display name</label><input id="display-name" name="display_name" required minLength={2} maxLength={60} defaultValue={profile.display_name} autoComplete="nickname" /><SubmitButton pendingLabel="Saving…">Save display name</SubmitButton></form> : <p role="status" className="account-notice">Your profile is not available yet.</p>}

    <div className="account-next"><h2>Your services & testimonies</h2>{instancesResult.data?.length ? <div className="eligible-services">{instancesResult.data.map(instance => { const review = reviews.find(item => item.service_instance_id === instance.id); return <div key={instance.id}><span><strong>{instance.service_title}</strong><small>{instance.completed_at}</small></span><span>{review ? review.status : 'Eligible for testimony'}</span>{!review && <form action={submitReview} className="review-form"><input type="hidden" name="service_instance_id" value={instance.id} /><label htmlFor={`rating-${instance.id}`}>Weaves</label><select id={`rating-${instance.id}`} name="rating" defaultValue="5">{[1, 2, 3, 4, 5].map(value => <option value={value} key={value}>{value} {value === 1 ? 'Weave' : 'Weaves'}</option>)}</select><label htmlFor={`review-${instance.id}`}>Your testimony</label><textarea id={`review-${instance.id}`} name="body" minLength={20} maxLength={1600} required /><p className="account-fine-print">By submitting, you agree to the <Link href="/terms-of-service#testimonies">testimony terms</Link> and request publication of your words, rating, chosen display name, and service title. Read how testimonies are grouped in our <Link href="/privacy-policy#public-testimonies">Privacy Policy</Link>.</p><SubmitButton pendingLabel="Submitting…">Submit for review</SubmitButton></form>}</div>; })}</div> : <p>Had a session before joining? Ask Seraph to confirm it using your account ID above. Once confirmed, your past session and testimony form will appear here.</p>}<Link href="/contact">Contact Seraph</Link></div>
    <div className="account-next"><h2>Pending testimonies</h2>{reviews.some(review => review.status === 'pending') ? <p>Your testimony is waiting for review.</p> : <p>No pending testimonies.</p>}<h2>My published testimonies</h2>{reviews.some(review => review.status === 'approved') ? <p>Your approved testimonies are visible on the <Link href="/reviews">Testimonies page</Link>.</p> : <p>No published testimonies yet.</p>}</div>
    {params.request && <div className="account-next"><h2>Book a service</h2><p className="account-fine-print">Choose an available appointment time, complete payment, and add the payment reference. Your sign-in email is shared with Seraph so confirmation details can reach you.</p><BookingForm offerings={services.map(({ slug, title, price }) => ({ slug, title, price }))} initialService={params.request} initialPaymentMethod={params.payment} /></div>}
    <div className="account-next"><h2>Your appointments</h2>{requestsResult.error ? <p>Appointments are being prepared.</p> : requestsResult.data?.length ? <div className="eligible-services">{requestsResult.data.map(request => { const addToCalendar = calendarUrl(request); return <div key={request.id}><span><strong>{request.service_title}</strong><small>{request.scheduled_at ? appointmentTime(request.scheduled_at, request.timezone) : request.payment_method}</small><small>Payment: {request.payment_method.replace('_', ' ')} · {request.payment_reference}</small><small>Zoom recording: {request.recording_opt_in ? 'Opted in' : 'Not requested'} ? AI notes: {request.ai_notes_opt_in ? 'Opted in' : 'Not requested'}</small><small>Payment status: {request.payment_status.replace('_', ' ')}</small>{request.contact_phone && <small>Contact: {request.contact_phone}</small>}{request.note && <small>Note: {request.note}</small>}{addToCalendar && <a href={addToCalendar} target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>}</span><span>{request.status === 'scheduled' && request.payment_status === 'awaiting_verification' ? 'Reserved' : request.status}</span></div>; })}</div> : <p>No appointments yet.</p>}</div>
    <div className="account-next"><h2>Marketing preferences</h2><p>Marketing email and text permission is optional. Withdraw permission for all existing bookings below. Appointment messages are separate. To change recording or AI-note permission, contact Seraph before your session or tell Seraph during it.</p><form action={withdrawMarketingConsent}><SubmitButton pendingLabel="Updating preferences...">Withdraw marketing permission</SubmitButton></form></div>
    <div className="account-links">{adminResult.data && <Link href="/admin">Open administration</Link>}<Link href="/services">Explore services</Link></div><form action={signOut}><SubmitButton pendingLabel="Signing out…">Sign out</SubmitButton></form>
  </div></section>;
}
