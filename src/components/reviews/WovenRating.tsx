export default function WovenRating({ rating }: { rating: number }) {
  const value = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
  if (value === null) return <p className="woven-rating-unavailable">Rating unavailable</p>;

  return <span className="woven-rating" role="img" aria-label={`${value} out of 5 stars`}>
    <span className="woven-rating-stars" aria-hidden="true">{'★'.repeat(value)}<span>{'☆'.repeat(5 - value)}</span></span>
    <span className="woven-rating-count" aria-hidden="true">{value} / 5</span>
  </span>;
}
