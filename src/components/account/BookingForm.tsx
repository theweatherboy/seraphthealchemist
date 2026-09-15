'use client';

import { useEffect, useMemo, useState } from 'react';
import SubmitButton from '@/components/auth/SubmitButton';
import { submitServiceRequest } from '@/app/account/request-actions';

type Offering = { slug: string; title: string; price: number };
type Slot = { slot_start: string; slot_end: string; slot_timezone: string };
type PaymentMethod = keyof typeof paymentLinks;

const paymentLinks = {
  cash_app: { label: 'Open Cash App', url: 'https://cash.app/$seraphthealchemist' },
  paypal: { label: 'Open PayPal', url: 'https://www.paypal.me/seraphthealchemist' },
  venmo: { label: 'Open Venmo', url: 'https://www.venmo.com/seraphthealchemist' },
  stripe: { label: 'Open Stripe checkout', url: 'https://buy.stripe.com/cN23cmePvfGK4ow28e' },
};

function isPaymentMethod(value: string | undefined): value is PaymentMethod {
  return value === 'cash_app' || value === 'paypal' || value === 'venmo' || value === 'stripe';
}

function slotLabel(slot: Slot) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: slot.slot_timezone, timeZoneName: 'short' }).format(new Date(slot.slot_start));
}

export default function BookingForm({ offerings, initialService, initialPaymentMethod }: { offerings: Offering[]; initialService: string; initialPaymentMethod?: string }) {
  const [service, setService] = useState(initialService);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(isPaymentMethod(initialPaymentMethod) ? initialPaymentMethod : '');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotStart, setSlotStart] = useState('');
  const [message, setMessage] = useState(service ? 'Finding available times…' : 'Choose an offering to see appointment times.');
  const selectedSlot = useMemo(() => slots.find(slot => slot.slot_start === slotStart), [slots, slotStart]);

  useEffect(() => {
    if (!service) { setSlots([]); setSlotStart(''); setMessage('Choose an offering to see appointment times.'); return; }
    const controller = new AbortController();
    setSlots([]); setSlotStart(''); setMessage('Finding available times…');
    fetch(`/api/booking-slots?service=${encodeURIComponent(service)}`, { signal: controller.signal })
      .then(async response => {
        const payload = await response.json() as { slots?: Slot[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? 'Appointment times are unavailable.');
        return payload.slots ?? [];
      })
      .then(nextSlots => { setSlots(nextSlots); setMessage(nextSlots.length ? 'Choose a time that feels right for you.' : 'There are no open times in the next four weeks for this offering.'); })
      .catch(error => { if (error.name !== 'AbortError') setMessage(error.message || 'Appointment times are unavailable.'); });
    return () => controller.abort();
  }, [service]);

  return <form action={submitServiceRequest} className="account-form">
    <label htmlFor="request-service">Offering</label>
    <select id="request-service" name="service_slug" value={service} onChange={event => setService(event.target.value)} required>
      <option value="">Choose an offering</option>
      {offerings.map(offering => <option value={offering.slug} key={offering.slug}>{offering.title} — ${offering.price}</option>)}
    </select>
    <label htmlFor="booking-time">Available appointment time</label>
    <select id="booking-time" name="slot_start" value={slotStart} onChange={event => setSlotStart(event.target.value)} disabled={!slots.length} required>
      <option value="">{slots.length ? 'Choose a time' : 'No time selected'}</option>
      {slots.map(slot => <option value={slot.slot_start} key={slot.slot_start}>{slotLabel(slot)}</option>)}
    </select>
    <input type="hidden" name="timezone" value={selectedSlot?.slot_timezone ?? 'America/Chicago'} />
    <p className="account-fine-print" role="status">{message}</p>
    <label htmlFor="payment-method">Payment method</label>
    <select id="payment-method" name="payment_method" value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as PaymentMethod | '')} required>
      <option value="">Choose a method</option><option value="cash_app">Cash App</option><option value="paypal">PayPal</option><option value="venmo">Venmo</option><option value="stripe">Stripe</option>
    </select>
    {paymentMethod && <a className="account-payment-link" href={paymentLinks[paymentMethod].url} target="_blank" rel="noopener noreferrer">{paymentLinks[paymentMethod].label} ↗</a>}
    <label htmlFor="payment-reference">Payment reference</label>
    <input id="payment-reference" name="payment_reference" required maxLength={120} placeholder="Receipt, username, or confirmation" />
    <label htmlFor="contact-phone">Phone or alternate contact (optional)</label>
    <input id="contact-phone" name="contact_phone" type="tel" maxLength={40} autoComplete="tel" />
    <label htmlFor="request-note">Note (optional)</label>
    <textarea id="request-note" name="note" maxLength={1000} />
    <p className="account-fine-print">Your selected time is reserved when you submit. Seraph verifies the payment before sending confirmation details.</p>
    <SubmitButton pendingLabel="Reserving your time…">Pay & reserve appointment</SubmitButton>
  </form>;
}
