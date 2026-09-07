import type { CSSProperties } from 'react';

/** Published ratings show only the bloom matching the customer's score. */
export default function WovenRating({ rating }: { rating: number }) {
  const value = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
  if (value === null) return <p className="woven-rating-unavailable">Rating unavailable</p>;

  return (
    <figure className="woven-rating" aria-label={`${value} out of 5 Weaves`}>
      <span className="woven-rating-art" aria-hidden="true" style={{ '--art-position': `${(value - 1) * 25}%` } as CSSProperties} />
      <figcaption className="woven-rating-caption">
        <strong>{value} <span>/ 5</span></strong><span aria-hidden="true">·</span><span>Weaves</span>
      </figcaption>
    </figure>
  );
}
