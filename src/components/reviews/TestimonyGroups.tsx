import WovenRating from './WovenRating';

export type PublicReview = {
  id: string;
  customer_id: string;
  rating: number;
  service_title?: string;
  review_revisions: { body: string }[];
};
export type TestimonyGroup = { customer_id: string; display_name: string; reviews: PublicReview[] };

export default function TestimonyGroups({ groups }: { groups: TestimonyGroup[] }) {
  return <div className="review-groups">{groups.map(group => (
    <details className="review-group" key={group.customer_id}>
      <summary>
        <span><strong>{group.display_name}</strong><small>{group.reviews.length} {group.reviews.length === 1 ? 'testimony' : 'testimonies'}</small></span>
        <span className="weave-disclosure" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="21" />
            <path className="weave-orbit" d="M24 7C43 20 43 28 24 41C5 28 5 20 24 7ZM7 24C20 5 28 5 41 24C28 43 20 43 7 24Z" />
            <path className="weave-plus-horizontal" d="M18 24H30" />
            <path className="weave-plus-vertical" d="M24 18V30" />
          </svg>
        </span>
      </summary>
      <div className="review-group-body">{group.reviews.map(review => (
        <article className="review-entry" key={review.id}>
          <span className="eyebrow">Verified testimony</span>
          {review.service_title && <h2>{review.service_title}</h2>}
          <WovenRating rating={review.rating} />
          <p>{review.review_revisions?.[0]?.body ?? ''}</p>
        </article>
      ))}</div>
    </details>
  ))}</div>;
}
