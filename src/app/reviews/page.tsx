import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import TestimonyGroups, { type PublicReview, type TestimonyGroup } from '@/components/reviews/TestimonyGroups';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Testimonies | Seraph, The Alchemist',
  description: 'Verified service testimonies from the sanctuary.',
};

export default async function ReviewsPage() {
  const client = await createClient();
  let groups: TestimonyGroup[] = [];
  let unavailable = !client;
  if (client) {
    const { data, error } = await client.from('reviews')
      .select('id,customer_id,rating,review_revisions!review_revisions_review_id_fkey(body)')
      .eq('status', 'approved').order('updated_at', { ascending: false });
    unavailable = Boolean(error);
    if (error) console.warn('[reviews/public] Query failed:', error.code);
    const reviews = (data ?? []) as unknown as PublicReview[];
    const serviceNames = new Map<string, string>();
    if (reviews.length) {
      const { data: services, error: serviceError } = await client.from('public_review_services')
        .select('review_id,service_title').in('review_id', reviews.map(review => review.id));
      if (serviceError) console.warn('[reviews/services] Service titles unavailable:', serviceError.code);
      for (const service of services ?? []) serviceNames.set(service.review_id, service.service_title);
    }
    const byCustomer = new Map<string, TestimonyGroup>();
    for (const review of reviews) {
      if (!byCustomer.has(review.customer_id)) {
        const { data: profile } = await client.from('public_profile_names')
          .select('display_name').eq('id', review.customer_id).maybeSingle();
        byCustomer.set(review.customer_id, {
          customer_id: review.customer_id,
          display_name: profile?.display_name ?? 'Sanctuary member',
          reviews: [],
        });
      }
      byCustomer.get(review.customer_id)!.reviews.push({ ...review, service_title: serviceNames.get(review.id) });
    }
    groups = [...byCustomer.values()];
  }
  return (
    <section className="reviews-page">
      <div className="reviews-header">
        <p className="eyebrow">Words from the weave</p>
        <h1>Testimonies</h1>
        <p>Reflections from people who have walked a path with Seraph.</p>
      </div>
      {unavailable ? <div className="reviews-empty" role="status">Testimonies could not be loaded. Please try again shortly.</div>
        : groups.length ? <TestimonyGroups groups={groups} />
        : <div className="reviews-empty"><p>Testimonies are being gathered.</p><Link href="/contact">Begin a session</Link></div>}
      <div className="reviews-footer">
        <Link href="/account">Sign in to view your eligible services</Link>
        <Link href="/">Return to the sanctuary</Link>
      </div>
    </section>
  );
}
