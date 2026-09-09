"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ExternalLink, X } from 'lucide-react';
type Purchase = { title: string; price?: string; slug?: string };
const PaymentContext = createContext<(purchase: Purchase) => void>(() => {});
export const usePayment = () => useContext(PaymentContext);
const methods = [
  { name: 'Cash App', url: 'https://cash.app/$seraphthealchemist', detail: '$seraphthealchemist' },
  { name: 'PayPal', url: 'https://www.paypal.me/seraphthealchemist', detail: 'Pay with PayPal' },
  { name: 'Venmo', url: 'https://www.venmo.com/seraphthealchemist', detail: '@seraphthealchemist' },
  { name: 'Stripe', url: 'https://buy.stripe.com/cN23cmePvfGK4ow28e', detail: 'Open secure checkout' },
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
  return <PaymentContext.Provider value={setPurchase}>
    {children}
    <dialog ref={dialog} className="payment-dialog" aria-labelledby="payment-title" aria-describedby="payment-description" onCancel={() => setPurchase(null)} onClick={e => { if(e.target === e.currentTarget) setPurchase(null); }}>
      <div className="payment-content">
        <button autoFocus className="payment-close" onClick={() => setPurchase(null)} aria-label="Close payment options"><X size={22} /></button>
        <p className="eyebrow">Continue your journey</p><h2 id="payment-title">Choose how to pay</h2>
        <p className="payment-selection">{purchase?.title} {purchase?.price && <strong>{purchase.price}</strong>}</p>
        <p id="payment-description">Choose a provider below. Check the recipient and amount before paying, and include the offering name in your payment note where available.</p>
        <div className="payment-methods">{methods.map(method => <a key={method.name} href={method.url} target="_blank" rel="noopener noreferrer"><span><strong>{method.name}</strong><small>{method.detail}</small></span><ExternalLink size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}</div>
        <p className="payment-note">After paying, <a href={purchase?.slug ? `/account?request=${encodeURIComponent(purchase.slug)}` : '/account'}>send your service request</a> with the payment reference. This lets Seraph confirm your session.</p>
      </div>
    </dialog>
  </PaymentContext.Provider>;
}
