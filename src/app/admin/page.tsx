import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAccount } from '@/lib/supabase/session';
import SubmitButton from '@/components/auth/SubmitButton';
import { addServiceInstance, moderateReview } from './actions';
import { services } from '@/data/services';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Administration | Seraph, The Alchemist', robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { client, user } = await requireAccount('/admin');
  const { data, error } = await client.from('admin_memberships').select('user_id').eq('user_id', user.id).maybeSingle();
  if (error || !data) notFound();
  const params = await searchParams;
  const [profilesResult, reviewsResult] = await Promise.all([
    (client as any).from('profiles').select('id, display_name').order('display_name'),
    (client as any).from('reviews').select('id, customer_id, service_instance_id, status, created_at').eq('status', 'pending').order('created_at', { ascending: true }),
  ]);
  const pendingReviews = reviewsResult.data ?? [];
  const revisionsResult = pendingReviews.length ? await (client as any).from('review_revisions').select('id, review_id, body, created_at').in('review_id', pendingReviews.map((review: any) => review.id)).order('created_at', { ascending: false }) : { data: [] };
  return <section className="account-page"><div className="account-panel">
    <p className="eyebrow">Sanctuary administration</p><h1>Welcome, Seraph</h1>
    <p>Your administrator access is confirmed.</p>
    {params.error && <p role="alert" className="account-notice">The requested administration action could not be completed.</p>}
    {params.saved && <p role="status" className="account-notice">Saved.</p>}
    <div className="account-next"><h2>Verify a completed service</h2><form action={addServiceInstance} className="account-form"><label htmlFor="customer-id">Customer</label><select id="customer-id" name="customer_id" required><option value="">Choose a member</option>{(profilesResult.data ?? []).map((profile: { id: string; display_name: string }) => <option value={profile.id} key={profile.id}>{profile.display_name} ({profile.id.slice(0, 8)})</option>)}</select><label htmlFor="service-slug">Published offering</label><select id="service-slug" name="service_slug" required><option value="">Choose an offering</option>{services.map(service => <option value={service.slug} key={service.slug}>{service.title}</option>)}</select><p className="account-fine-print">The title and slug are filled from the published offerings list automatically.</p><label htmlFor="completed-at">Completed on</label><input id="completed-at" name="completed_at" type="date" required /><SubmitButton pendingLabel="Saving…">Confirm service</SubmitButton></form></div>
    <div className="account-next"><h2>Testimonies awaiting review</h2>{reviewsResult.error ? <p role="alert">The review queue could not be loaded yet. Apply the reviews migration again if this persists.</p> : pendingReviews.length ? pendingReviews.map((review: any) => { const revision = (revisionsResult.data ?? []).find((item: any) => item.review_id === review.id); return <article className="review-entry" key={review.id}><h3>Pending testimony</h3><p>{revision?.body ?? 'Revision unavailable'}</p><form action={moderateReview} className="account-links"><input type="hidden" name="review_id" value={review.id} /><input type="hidden" name="revision_id" value={revision?.id ?? ''} /><button name="decision" value="approved" type="submit">Publish</button><button name="decision" value="rejected" type="submit">Reject</button></form></article> }) : <p>No pending testimonies.</p>}</div>
    <div className="account-links"><Link href="/account">Return to my account</Link></div>
  </div></section>;
}
