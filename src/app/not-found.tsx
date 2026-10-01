import Link from 'next/link';

export default function NotFound() {
  return <section className="sanctuary-lost">
    <div className="sanctuary-lost-copy">
      <p className="eyebrow">404 · Still on the path</p>
      <h1>A different doorway awaits</h1>
      <p>This page could not be found. Return to the sanctuary and find your next step.</p>
      <Link href="/">Return to the sanctuary <span aria-hidden="true">↗</span></Link>
    </div>
  </section>;
}
