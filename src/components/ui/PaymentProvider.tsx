"use client";
import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ExternalLink, X } from 'lucide-react';
type Purchase = { title: string; price?: string; slug?: string };
type PaymentMethod = 'cash_app' | 'paypal' | 'venmo' | 'stripe';
const PaymentContext = createContext<(purchase: Purchase) => void>(() => {});
export const usePayment = () => useContext(PaymentContext);
const methods: { key: PaymentMethod; name: string; url: string; detail: string }[] = [
  { key: 'cash_app', name: 'Cash App', url: 'https://cash.app/$seraphthealchemist', detail: '$seraphthealchemist' },
  { key: 'paypal', name: 'PayPal', url: 'https://www.paypal.me/seraphthealchemist', detail: 'Pay with PayPal' },
  { key: 'venmo', name: 'Venmo', url: 'https://www.venmo.com/seraphthealchemist', detail: '@seraphthealchemist' },
  { key: 'stripe', name: 'Stripe', url: 'https://buy.stripe.com/cN23cmePvfGK4ow28e', detail: 'Open secure checkout' },
];
export default function PaymentProvider({ children }: { children: ReactNode }) {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!purchase) return;
    const opener = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previous; opener?.focus(); };
  }, [purchase]);
  const bookingUrl = (method: PaymentMethod) => purchase?.slug
    ? `/account?request=${encodeURIComponent(purchase.slug)}&payment=${method}`
    : '/account';
  return <PaymentContext.Provider value={setPurchase}>
    {children}
    <dialog ref={dialog} className="payment-dialog" aria-labelledby="payment-title" aria-describedby="payment-description" onCancel={() => setPurchase(null)} onClick={e => { if(e.target === e.currentTarget) setPurchase(null); }}>
      <div className="payment-content">
        <button autoFocus className="payment-close" onClick={() => setPurchase(null)} aria-label="Close payment options"><X size={22} /></button>
        <p className="eyebrow">Continue your journey</p><h2 id="payment-title">Choose how to pay</h2>
        <p className="payment-selection">{purchase?.title} {purchase?.price && <strong>{purchase.price}</strong>}</p>
        <p id="payment-description">Choose a provider below. Check the recipient and amount before paying, and include the offering name in your payment note where available.</p>
        <p className="payment-note">Before paying, review the <Link href="/terms-of-service" onClick={() => setPurchase(null)}>Terms of Service</Link> and <Link href="/privacy-policy" onClick={() => setPurchase(null)}>Privacy Policy</Link>. By proceeding with a purchase, you confirm you are at least 18 and agree to the Terms of Service.</p>
        <div className="payment-methods">{methods.map(method => <a key={method.key} href={method.url} target="_blank" rel="noopener noreferrer" onClick={() => { window.location.assign(bookingUrl(method.key)); }}><span><strong>{method.name}</strong><small>{method.detail}</small></span><ExternalLink size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}</div>
        <p className="payment-note">Choosing a provider opens payment in a new tab and brings you to scheduling here, with your offering and payment method ready. Add the payment reference, choose a time, then reserve it for Seraph&apos;s review.</p>
      </div>
    </dialog>
  </PaymentContext.Provider>;
}
