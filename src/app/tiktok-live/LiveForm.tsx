'use client';

import { useActionState, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { livePayments, liveRequestOfferings, type LiveFormState } from '@/lib/tiktok-live';
import { submitLiveRequest, addManualLiveRequest } from './actions';
import styles from './tiktok-live.module.css';
import BirthDetailFields, { type BirthPlace } from '@/components/forms/BirthDetailFields';

export default function LiveForm({ manual = false }: { manual?: boolean }) {
  const [generation, setGeneration] = useState(0);
  return <LiveRequestForm key={generation} manual={manual} onNew={() => setGeneration(value => value + 1)} />;
}

function LiveRequestForm({ manual, onNew }: { manual: boolean; onNew: () => void }) {
  const [state, action, pending] = useActionState<LiveFormState, FormData>(manual ? addManualLiveRequest : submitLiveRequest, { ok: false, message: '' });
  const [id, setId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState<BirthPlace | null>(null);
  const ready = Boolean(id && firstName.trim() && lastName.trim() && terms && privacy);
  const payment = livePayments.find(method => method.id === state.payment);

  if (state.ok) return <section className={styles.paymentPanel} aria-label="LIVE queue confirmation">
    <p role="status">{state.message}</p>
    {!manual && payment && <div className={styles.quickPayments}><a className={styles.quickPayment} data-method={payment.id} href={payment.href} target="_blank" rel="noopener noreferrer" aria-label={`Donate with ${payment.name} (opens in a new tab)`}>Donate with {payment.name}<ArrowUpRight size={15} aria-hidden="true" /></a></div>}
    {manual && <button type="button" className={styles.submit} onClick={onNew}>Add another person</button>}
  </section>;

  return <form action={action} className={styles.liveForm} onReset={event => event.preventDefault()} onChange={() => { if (!id) setId(crypto.randomUUID()); }}>
    <input type="hidden" name="request_id" value={id} />
    <fieldset disabled={pending} className={styles.fieldset}>
      <legend className={styles.formHeading}>{manual ? 'Add to LIVE queue' : 'Your details'}</legend>
      <div className={styles.fields}>
        <label>First name<input name="first_name" autoComplete="given-name" required maxLength={60} value={firstName} onChange={event => setFirstName(event.target.value)} /></label>
        <label>Last name<input name="last_name" autoComplete="family-name" required maxLength={60} value={lastName} onChange={event => setLastName(event.target.value)} /></label>
      </div>
      <fieldset className={styles.offeringChoices}>
        <legend>What would you like during LIVE?</legend>
        <p>Select all that apply (optional).</p>
        <div>
          {liveRequestOfferings.map(offering => <label key={offering.id} className={styles.check}>
            <input type="checkbox" name="offerings" value={offering.id} />
            <span>{offering.title}</span>
          </label>)}
        </div>
      </fieldset>
      {manual && <p>Record these acknowledgments only after the person has agreed to both policies.</p>}
      <section className={styles.birthDetails} aria-label="Optional birth details">
        <div className={styles.birthHeading}><span aria-hidden="true">✧</span><div><h2>A little more about your beginnings</h2><p>Birth details · entirely optional</p></div></div>
        <p className={styles.birthHint}>Share only what you know. You can leave any field blank.</p>
        <BirthDetailFields optional dark={!manual} date={birthDate} time={birthTime} place={birthPlace} onDate={setBirthDate} onTime={setBirthTime} onPlace={setBirthPlace} />
        <p className={styles.birthHint}>Any birth details you submit are saved with this LIVE request and visible to Seraph in the private queue. City search uses the same birthplace directory as the Birth Chart.</p>
      </section>
      <label className={styles.check}><input type="checkbox" name="terms" required checked={terms} onChange={event => setTerms(event.target.checked)} /><span>{manual ? 'The person agrees to the ' : 'I have read and agree to the '}<a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>{manual ? ' and confirms they are 18 or older.' : ', and I confirm I am 18 or older.'}</span></label>
      <label className={styles.check}><input type="checkbox" name="privacy" required checked={privacy} onChange={event => setPrivacy(event.target.checked)} /><span>{manual ? 'The person agrees to the ' : 'I have read and agree to the '}<a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and the use of {manual ? 'their' : 'my'} details to manage this LIVE request.</span></label>
      <p className={styles.paymentNote}>Enter your name and accept both policies, then choose a payment method to join the private LIVE queue and reveal your donation link. Seraph will confirm payment.</p>
      {ready && <div className={styles.quickPayments} aria-label="Choose payment method">
        {livePayments.map(method => <button key={method.id} className={styles.quickPayment} data-method={method.id} type="submit" name="payment" value={method.id} disabled={pending}>{method.name}<ArrowUpRight size={15} aria-hidden="true" /></button>)}
      </div>}
      {pending && <p role="status">Saving your details…</p>}
      {state.message && <p role="alert" className={styles.error}>{state.message}</p>}
    </fieldset>
  </form>;
}
