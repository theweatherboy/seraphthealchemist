export default function StarChoice({ name = 'rating' }: { name?: string }) {
  return <fieldset className="star-choice"><legend>Rating</legend><div className="star-options">
    {[5, 4, 3, 2, 1].map(value => <label key={value} title={`${value} ${value === 1 ? 'star' : 'stars'}`}>
      <input type="radio" name={name} value={value} required defaultChecked={value === 5} aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`} />
      <span aria-hidden="true">★</span>
    </label>)}
  </div><span className="star-choice-help">Choose 1 to 5 stars</span></fieldset>;
}
