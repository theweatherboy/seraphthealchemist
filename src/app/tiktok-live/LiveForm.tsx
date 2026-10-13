'use client';

import { useActionState, useState } from 'react';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { liveOfferings, livePayments, type LiveFormState } from '@/lib/tiktok-live';
import { submitLiveRequest, addManualLiveRequest } from './actions';
import styles from './tiktok-live.module.css';

export default function LiveForm({ manual = false }: { manual?: boolean }) {
  const [generation, setGeneration] = useState(0);
  return <LiveRequestForm key={generation} manual={manual} onNew={() => setGeneration(value => value + 1)} />;
}

function LiveRequestForm({ manual, onNew }: { manual: boolean; onNew: () => void }) {
  const [state, action, pending] = useActionState<LiveFormState, FormData>(manual ? addManualLiveRequest : submitLiveRequest, { ok: false, message: '' });
  const [id, setId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState(false);
  const [payment, setPayment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const hasGuidance = selected.includes('guidance');
  const total = liveOfferings.filter(item => selected.includes(item.id)).reduce((sum, item) => sum + item.price, 0) + (hasGuidance && extra ? 11 : 0);
  const paymentLink = livePayments.find(item => item.id === payment);
  const changeDetails = () => setConfirmed(false);
  const canSubmit = Boolean(id && selected.length && payment && (name.trim() || email.trim()) && terms && privacy && confirmed && !pending);

  if (state.ok) return <section className={styles.paymentPanel} aria-label="LIVE queue confirmation">
    <p role="status">{state.message}</p>
    {manual && <button type="button" className={styles.submit} onClick={onNew}>Add another person</button>}
  </section>;

  return <form id={manual ? 'manual-live-request' : 'live-request'} action={action} className={styles.liveForm} onReset={event => event.preventDefault()} onChange={() => { if (!id) setId(crypto.randomUUID()); }}>
    <input type="hidden" name="request_id" value={id} />
    <fieldset disabled={pending} className={styles.fieldset}>
      <legend className={styles.formHeading}>1. Choose {manual ? 'their' : 'your'} LIVE offerings</legend>
      <p className={styles.subtitle}>Select one or more. These sessions take place during the TikTok LIVE.</p>
      <div className={styles.cards}>
        {liveOfferings.map(offering => <label key={offering.id} className={styles.card}>
          <div className={styles.cardHeading}>
            <span className={styles.choiceTitle}><input type="checkbox" name="services" value={offering.id} checked={selected.includes(offering.id)} onChange={event => {
              setSelected(current => event.target.checked ? [...current, offering.id] : current.filter(id => id !== offering.id));
              if (offering.id === 'guidance' && !event.target.checked) setExtra(false);
              changeDetails();
            }} /><strong>{offering.title}</strong></span>
            <span className={styles.price}>${offering.price}</span>
          </div>
          <span className={styles.duration}><Clock3 size={15} aria-hidden="true" /> {offering.duration}</span>
          <span className={styles.description}>{offering.description}</span>
          {'note' in offering && <span className={styles.note}>{offering.note}</span>}
        </label>)}
      </div>
      {hasGuidance && <label className={styles.check}><input type="checkbox" name="extra" checked={extra} onChange={event => { setExtra(event.target.checked); changeDetails(); }} /> Add extra time to “What do I need to know?” (+$11)</label>}
    </fieldset>

    <fieldset disabled={pending} className={styles.fieldset}>
      <legend className={styles.formHeading}>2. {manual ? 'Client details & donation' : 'Your details & donation'}</legend>
      <p>Enter a name, TikTok handle, or email so Seraph can identify {manual ? 'the person' : 'you'} on LIVE.</p>
      <div className={styles.fields}>
        <label>Name / TikTok handle<input name="name" autoComplete="name" maxLength={120} required={!email.trim()} value={name} onChange={event => { setName(event.target.value); changeDetails(); }} /></label>
        <label>Email {name.trim() ? '(optional)' : ''}<input name="email" type="email" autoComplete="email" maxLength={254} required={!name.trim()} value={email} onChange={event => { setEmail(event.target.value); changeDetails(); }} /></label>
        <label>Payment method<select name="payment" required value={payment} onChange={event => { setPayment(event.target.value); changeDetails(); }}><option value="">Choose a payment method</option>{livePayments.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label>Payment name or reference (optional)<input name="reference" maxLength={120} value={reference} onChange={event => { setReference(event.target.value); changeDetails(); }} /><small>Useful if the payment name differs from the TikTok name.</small></label>
      </div>
      <div className={styles.summary} aria-live="polite">
        <strong>Expected donation: ${total}</strong>
        <span>{selected.length ? liveOfferings.filter(item => selected.includes(item.id)).map(item => item.title).join(' · ') + (hasGuidance && extra ? ' · Guidance extra time' : '') : 'Select an offering to see the total.'}</span>
      </div>
      {!manual && paymentLink && <><a className={styles.payment} href={paymentLink.href} target="_blank" rel="noopener noreferrer"><span><strong>Pay with {paymentLink.name}</strong><small>Opens in a new tab — return here to confirm</small></span><ArrowUpRight size={20} aria-hidden="true" /></a><p className={styles.paymentNote}>Enter or check the amount on the payment page. After donating, return here and send your details to the LIVE queue.</p></>}
    </fieldset>

    <fieldset disabled={pending} className={styles.fieldset}>
      <legend className={styles.formHeading}>3. Acknowledge & confirm</legend>
      <p>{manual ? 'Record these acknowledgments only after the person has agreed to both linked policies. This entry will be recorded as entered by an administrator.' : 'Your details are sent to Seraph’s private LIVE queue only when you submit below.'}</p>
      <label className={styles.check}><input type="checkbox" name="terms" required checked={terms} onChange={event => setTerms(event.target.checked)} /><span>{manual ? 'The person has acknowledged and agreed to the ' : 'I have read and agree to the '}<a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>{manual ? ' and confirmed they are 18 or older.' : ', and I confirm I am 18 or older.'}</span></label>
      <label className={styles.check}><input type="checkbox" name="privacy" required checked={privacy} onChange={event => setPrivacy(event.target.checked)} /><span>{manual ? 'The person has acknowledged and agreed to the ' : 'I have read and agree to the '}<a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and the use of {manual ? 'their' : 'my'} submitted details to manage this LIVE request.</span></label>
      <label className={styles.check}><input type="checkbox" name="confirmed" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>{manual ? 'I confirm the client details, selected offerings, payment method, and expected donation shown above.' : 'I confirm my details and selected offerings, and I have made my donation using the payment method above.'} Payment will be checked by Seraph.</span></label>
      <p className={styles.paymentNote}>For the current TikTok LIVE only. No appointment or calendar reservation is created.</p>
      {state.message && <p role="alert" className={styles.error}>{state.message}</p>}
      <button className={styles.submit} type="submit" disabled={!canSubmit}>{pending ? 'Sending…' : manual ? 'Add to LIVE queue' : 'Confirm & join LIVE queue'}</button>
    </fieldset>
  </form>;
}
