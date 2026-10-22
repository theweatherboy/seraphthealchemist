import type { Metadata } from 'next';
import LiveAccess from './LiveAccess';
import { createClient } from '@/lib/supabase/server';
import styles from './tiktok-live.module.css';

const title = 'TikTok LIVE Offerings | Seraph, The Alchemist';
const description = 'Join the TikTok LIVE queue and donate through Cash App, PayPal, Venmo, or Stripe.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/tiktok-live' },
  openGraph: { title, description, url: '/tiktok-live' },
  twitter: { title, description },
};

export default async function TikTokLivePage() {
  const client = await createClient();
  const user = client ? (await client.auth.getUser()).data.user : null;
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.badge}><span aria-hidden="true" /> TikTok LIVE only</span>
          <h1>TikTok LIVE offerings</h1>
          <p className={styles.intro}>A little guidance. A moment of connection.</p>
          <p className={styles.notice}>For <strong>TikTok LIVE readings ONLY.</strong> Enter your name and accept both policies to continue to your donation.</p>
        </header>

        <LiveAccess signedIn={Boolean(user)} />
        <p className={styles.footer}>With gratitude, Seraph, The Alchemist</p>
      </div>
    </div>
  );
}
