import type { Metadata } from 'next';
import LiveForm from './LiveForm';
import styles from './tiktok-live.module.css';

const title = 'TikTok LIVE Offerings | Seraph, The Alchemist';
const description = 'TikTok LIVE readings only. Explore suggested donations and pay through Cash App, PayPal, Venmo, or Stripe.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/tiktok-live' },
  openGraph: { title, description, url: '/tiktok-live' },
  twitter: { title, description },
};

export default function TikTokLivePage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.badge}><span aria-hidden="true" /> TikTok LIVE only</span>
          <h1>TikTok LIVE offerings</h1>
          <p className={styles.intro}>A little guidance. A moment of connection.</p>
          <p className={styles.notice}>This page is for <strong>TikTok LIVE readings ONLY.</strong> Choose your offerings, make your donation, then confirm below to join the LIVE queue.</p>
        </header>

        <LiveForm />
        <p className={styles.footer}>With gratitude, Seraph, The Alchemist</p>
      </div>
    </div>
  );
}
