'use client';

import { useState } from 'react';
import { signInWithGoogle } from '@/app/login/actions';
import SubmitButton from '@/components/auth/SubmitButton';
import LiveForm from './LiveForm';
import styles from './tiktok-live.module.css';

export default function LiveAccess({ signedIn }: { signedIn: boolean }) {
  const [guest, setGuest] = useState(false);
  if (signedIn || guest) return <>
    <p className={styles.accessStatus}>{signedIn ? 'Continuing with your account' : 'Continuing as a guest'}{!signedIn && <button type="button" onClick={() => setGuest(false)}>Change</button>}</p>
    <LiveForm />
  </>;

  return <section className={styles.paymentPanel} aria-labelledby="live-access-heading">
    <h2 id="live-access-heading">How would you like to continue?</h2>
    <p className={styles.paymentNote}>Sign in or create an account with Google, or continue as a guest.</p>
    <div className={styles.accessActions}>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value="/tiktok-live" />
        <SubmitButton className={styles.googleButton} pendingLabel="Opening Google…">Continue with Google</SubmitButton>
      </form>
      <button type="button" className={styles.guestButton} onClick={() => setGuest(true)}>Continue as guest</button>
    </div>
    <p className={styles.paymentNote}>Your first Google sign-in creates an account. Guest access does not require an account. You’ll review the Terms of Service and Privacy Policy before submitting your donation details.</p>
  </section>;
}
