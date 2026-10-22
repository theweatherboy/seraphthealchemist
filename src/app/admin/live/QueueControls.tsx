'use client';

import { useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import SubmitButton from '@/components/auth/SubmitButton';
import { updateLiveEntry, saveLivePayment } from './actions';
import { livePayments, type LiveEntry } from '@/lib/tiktok-live';
import styles from './queue.module.css';

function PaymentButtons() {
  const { pending } = useFormStatus();
  return <div className={styles.actions}>
    <button className="account-button" type="submit" name="operation" value="save" disabled={pending}>Save as unverified</button>
    <button className="account-button" type="submit" name="operation" value="confirm" disabled={pending}>{pending ? 'Saving…' : 'Confirm payment'}</button>
  </div>;
}

export function PaymentEditor({ entry }: { entry: LiveEntry }) {
  return <form action={saveLivePayment} className={styles.paymentEditor}>
    <input type="hidden" name="id" value={entry.id} />
    <div className={styles.paymentFields}>
      <label>Amount donated (USD)<input name="amount" type="number" min="0" max="99999999.99" step="0.01" required defaultValue={entry.donated_amount ?? ''} placeholder="0.00" /></label>
      <label>Payment method<select name="payment" required defaultValue={entry.payment_method}>{livePayments.map(method => <option key={method.id} value={method.id}>{method.name}</option>)}</select></label>
    </div>
    <PaymentButtons />
  </form>;
}

export function QueueRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !document.activeElement?.closest('form')) startTransition(() => router.refresh());
    }, 20000);
    return () => clearInterval(timer);
  }, [router]);
  return <button type="button" className="account-button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? 'Refreshing…' : 'Refresh queue'}</button>;
}

export function QueueAction({ id, operation, label, person }: { id: string; operation: string; label: string; person: string }) {
  return <form action={updateLiveEntry} onSubmit={event => {
    if (operation === 'removed' && !window.confirm(`Remove ${person} from the LIVE queue? The entry remains in Removed for your records.`)) event.preventDefault();
  }}><input type="hidden" name="id" value={id} /><input type="hidden" name="operation" value={operation} /><SubmitButton pendingLabel="Saving…">{label}</SubmitButton></form>;
}
