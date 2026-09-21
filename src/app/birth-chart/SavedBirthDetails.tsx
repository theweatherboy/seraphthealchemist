'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { BirthDetails } from '@/lib/birth-profile';
import styles from './birth-chart.module.css';

export default function SavedBirthDetails({ details, onLoad, onClear }: { details: BirthDetails | null; onLoad: (details: BirthDetails) => void; onClear: () => void }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saved, setSaved] = useState<BirthDetails | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const account = useRef<string | null | undefined>(undefined);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => {
    let disposed = false;
    const check = async () => {
      if (pending.current) return;
      const controller = new AbortController();
      pending.current = controller;
      setChecking(true);
      try {
        const response = await fetch('/api/birth-chart/profile', { cache: 'no-store', signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Saved birth details could not be loaded.');
        if (disposed) return;
        const nextAccount = payload.signedIn ? payload.accountId : null;
        if (account.current !== undefined && account.current !== nextAccount) { onClear(); setConsent(false); setMessage(''); }
        account.current = nextAccount;
        setSignedIn(payload.signedIn === true); setSaved(payload.profile); setError('');
      } catch (caught) {
        if (!disposed && !controller.signal.aborted) { setError(caught instanceof Error ? caught.message : 'Saved birth details could not be loaded.'); setSaved(null); }
      } finally { if (!disposed) setChecking(false); if (pending.current === controller) pending.current = null; }
    };
    void check();
    window.addEventListener('focus', check);
    return () => { disposed = true; pending.current?.abort(); pending.current = null; window.removeEventListener('focus', check); };
  }, [onClear]);

  async function update(remove: boolean) {
    if (pending.current || !account.current || (!remove && (!consent || !details))) return;
    const controller = new AbortController();
    pending.current = controller; setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/birth-chart/profile', { method: remove ? 'DELETE' : 'PUT', headers: { 'Content-Type': 'application/json', 'X-Birth-Profile-Account': account.current }, body: remove ? undefined : JSON.stringify({ ...details, consent: true }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
      const payload = await response.json();
      if (response.status === 401 || response.status === 409) { setSignedIn(false); setSaved(null); account.current = null; onClear(); }
      if (!response.ok) throw new Error(payload.error || 'Your saved details could not be updated.');
      if (controller.signal.aborted) return;
      setSaved(remove ? null : payload.profile); setConsent(false);
      if (remove) onClear();
      setMessage(remove ? 'Your saved birth details have been deleted. This page’s chart and conversation have also been cleared.' : 'Your birth details are saved privately to your account. You can load or delete them here on your next visit.');
    } catch (caught) { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : 'Your saved details could not be updated.'); }
    finally { if (pending.current === controller) { pending.current = null; setBusy(false); } }
  }

  return <section id="saved-birth-details" className={styles.savedDetails} aria-labelledby="saved-details-title">
    <h2 id="saved-details-title">Keep your birth details for next time</h2>
    <p>Optional and private to your account. Your chart works without saving anything.</p>
    {checking && <p role="status">Checking your saved details…</p>}
    {signedIn === false && <p><Link href="/login">Sign in</Link> to choose whether to save your birth date, local time, and selected birthplace.</p>}
    {signedIn === true && <>
      {saved && <div className={styles.savedActions}>
        <button type="button" disabled={busy || checking} onClick={() => { onLoad(saved); setMessage('Saved details loaded above. Select Reveal my chart to calculate a fresh year of transits and give your companion chart context.'); }}>Use saved details</button>
        <button type="button" disabled={busy || checking} onClick={() => void update(true)}>Delete saved details</button>
      </div>}
      <label className={styles.saveConsent}><input type="checkbox" checked={consent} disabled={busy || checking} onChange={event => setConsent(event.target.checked)} /><span>I choose to save my birth date, local time, and birthplace to my private account. I can delete them at any time.</span></label>
      <button type="button" className={styles.saveButton} disabled={!consent || !details || busy || checking} onClick={() => void update(false)}>{busy ? 'Updating…' : saved ? 'Replace saved details with this form' : 'Save these birth details'}</button>
      <p className={styles.savedNote}>Saving applies only to the details currently in the form. Later edits are saved only when you select this permission and save again. Chat conversations are not saved.</p>
    </>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </section>;
}
