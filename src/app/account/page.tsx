import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAccount } from '@/lib/supabase/session';
import SubmitButton from '@/components/auth/SubmitButton';
import { signOut } from '@/app/login/actions';
import { updateProfile } from './actions';
import { submitReview } from './review-actions';
import { submitServiceRequest } from './request-actions';
import { services } from '@/data/services';

type EligibleInstance = { id: string; service_title: string; completed_at: string; reviews?: { id: string; status: string }[] };

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My account | Seraph, The Alchemist', robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; request?: string }> }) {
  const { client, user } = await requireAccount();
  const [params, profileResult, adminResult, instancesResult, reviewsResult, requestsResult] = await Promise.all([
    searchParams,
    client.from('profiles').select('display_name, public_id').eq('id', user.id).maybeSingle(),
    client.from('admin_memberships').select('user_id').eq('user_id', user.id).maybeSingle(),
    (client as any).from('service_instances').select('id, service_title, completed_at').eq('customer_id', user.id).is('revoked_at', null).order('completed_at', { ascending: false }),
    (client as any).from('reviews').select('id, service_instance_id, status, rating').eq('customer_id', user.id).order('created_at', { ascending: false }),
    (client as any).from('service_requests').select('id, service_title, payment_method, status, created_at').eq('customer_id', user.id).order('created_at', { ascending: false }),
  ]);
  const profile = profileResult.data;
  if (profileResult.error) {
    console.error('[account/profile] Profile lookup failed:', profileResult.error.code, profileResult.error.message);
  }
  if (adminResult.error) {
    console.error('[account/admin] Membership lookup failed:', adminResult.error.code, adminResult.error.message);
  }
  const errors: Record<string, string> = {
    name: 'Choose a name between 2 and 60 characters, without control characters.',
    save: 'Your name could not be saved. Please try again.',
    review: 'Please write 20–1,600 characters. A service can only receive one testimony.',
    signout: 'Sign-out could not be completed. Please try again.',
  };
  return <section className="account-page"><div className="account-panel">
    <p className="eyebrow">Your sanctuary</p><h1>My account</h1>
    <p>Signed in as <strong>{user.email}</strong>. This email is private.</p>
    {params.error && <p role="alert" className="account-notice">{errors[params.error] ?? 'Something went wrong. Please try again.'}</p>}
    {params.saved === '1' && <p role="status" className="account-notice">Your display name has been saved.</p>}
    {params.saved === 'review' && <p role="status" className="account-notice">Your testimony was submitted for review. Seraph will publish it after confirming the details.</p>}
    {profile ? <form action={updateProfile} className="account-form">
      <label htmlFor="display-name">Public display name</label>
      <input id="display-name" name="display_name" required minLength={2} maxLength={60} defaultValue={profile.display_name} aria-describedby="display-name-help" autoComplete="nickname" />
      <p id="display-name-help" className="account-fine-print">A first name, initials, or a chosen name is fine. Future testimonies from this account will be grouped under this name. Nothing is published by saving your profile.</p>
      <SubmitButton pendingLabel="Saving…">Save display name</SubmitButton>
    </form> : <p role="status" className="account-notice">You&apos;re signed in, but your profile is not available yet. Please try again later or contact Seraph.</p>}
    <div className="account-next"><h2>Your services &amp; testimonies</h2>{instancesResult.error ? <p>Service verification is being prepared. Please check back after Seraph confirms a session.</p> : instancesResult.data?.length ? <div className="eligible-services">{(instancesResult.data as EligibleInstance[]).map(instance => { const review = (reviewsResult.data ?? []).find((item: any) => item.service_instance_id === instance.id); return <div key={instance.id}><span><strong>{instance.service_title}</strong><small>{instance.completed_at}</small></span><span>{review ? review.status : 'Eligible for testimony'}</span>{!review && <form action={submitReview} className="review-form"><input type="hidden" name="service_instance_id" value={instance.id} /><label htmlFor={`rating-${instance.id}`}>Weaves</label><select id={`rating-${instance.id}`} name="rating" defaultValue="5">{[1,2,3,4,5].map(value => <option value={value} key={value}>{value} {value === 1 ? 'Weave' : 'Weaves'}</option>)}</select><label htmlFor={`review-${instance.id}`}>Your testimony</label><textarea id={`review-${instance.id}`} name="body" minLength={20} maxLength={1600} required placeholder="Share what this service opened for you…" /><SubmitButton pendingLabel="Submitting…">Submit for review</SubmitButton></form>}</div>})}</div> : <p>Completed sessions confirmed by Seraph will appear here and unlock a testimony.</p>}<Link href="/contact">Contact Seraph</Link></div>
    <div className="account-next"><h2>Pending testimonies</h2>{(reviewsResult.data ?? []).filter((review: any) => review.status === 'pending').length ? <p>Your testimony is waiting for Seraph&apos;s review.</p> : <p>No pending testimonies.</p>}<h2>My published testimonies</h2>{(reviewsResult.data ?? []).filter((review: any) => review.status === 'approved').length ? <p>Your approved testimonies are visible on the <Link href="/reviews">Testimonies page</Link>.</p> : <p>No published testimonies yet.</p>}</div>
    {params.request && <div className="account-next"><h2>Request a service</h2><form action={submitServiceRequest} className="account-form"><label htmlFor="request-service">Offering</label><select id="request-service" name="service_slug" defaultValue={params.request} required><option value="">Choose an offering</option>{services.map(service => <option value={service.slug} key={service.slug}>{service.title} — ${service.price}</option>)}</select><label htmlFor="payment-method">Payment method</label><select id="payment-method" name="payment_method" required><option value="">Choose a method</option><option value="cash_app">Cash App</option><option value="paypal">PayPal</option><option value="venmo">Venmo</option><option value="stripe">Stripe</option></select><label htmlFor="payment-reference">Payment reference</label><input id="payment-reference" name="payment_reference" required maxLength={120} placeholder="Receipt, username, or confirmation" /><label htmlFor="request-note">Note (optional)</label><textarea id="request-note" name="note" maxLength={1000} /><SubmitButton pendingLabel="Sending…">Send service request</SubmitButton></form></div>}
    <div className="account-next"><h2>Your service requests</h2>{requestsResult.error ? <p>Service requests are being prepared. Please check back shortly.</p> : requestsResult.data?.length ? <div className="eligible-services">{requestsResult.data.map((request: any) => <div key={request.id}><span><strong>{request.service_title}</strong><small>{request.payment_method}</small></span><span>{request.status}</span></div>)}</div> : <p>No service requests yet.</p>}</div>
    <div className="account-links">{adminResult.data && <Link href="/admin">Open administration</Link>}<Link href="/services">Explore services</Link></div>
    <form action={signOut}><SubmitButton pendingLabel="Signing out…">Sign out</SubmitButton></form>
  </div></section>;
}
