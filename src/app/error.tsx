'use client';

import Link from 'next/link';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="account-page">
    <div className="account-panel" role="alert">
      <p className="eyebrow">A pause on the path</p>
      <h1>This page couldn’t load</h1>
      <p>We couldn’t load the information for this page. Please try again.</p>
      <button type="button" className="account-button" onClick={retry}>Try again</button>
      <div className="account-links"><Link href="/">Return to the sanctuary</Link><Link href="/contact">Contact Seraph</Link></div>
    </div>
  </section>;
}
