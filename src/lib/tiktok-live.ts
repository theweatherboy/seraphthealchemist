export const liveOfferings = [
  { id: 'guidance', title: 'What do I need to know?', price: 55, duration: '5–7 mins', description: 'A quick reading tapping into your higher self or your guides for what you need to know at this time.', note: 'Extra time can be added for $11.' },
  { id: 'mediumship', title: 'Mediumship', price: 88, duration: '10–12 mins', description: 'A dedicated mediumship reading during the LIVE.', note: 'This reading cannot be extended.' },
  { id: 'energy', title: 'Energy healing', price: 77, duration: '5 mins', description: 'A focused energy healing session during the LIVE.' },
  { id: 'chakra', title: 'Blockage scan & removal', price: 55, duration: '5–10 mins', description: 'A blockage scan and removal for a single chakra.' },
  { id: 'aura', title: 'Aura cleanse & reset', price: 66, duration: '5–10 mins', description: 'An aura cleansing and reset session during the LIVE.' },
] as const;

export const livePayments = [
  { id: 'cash_app', name: 'Cash App', detail: '$seraphthealchemist', href: 'https://cash.app/$seraphthealchemist' },
  { id: 'paypal', name: 'PayPal', detail: 'Pay with PayPal', href: 'https://www.paypal.me/seraphthealchemist' },
  { id: 'venmo', name: 'Venmo', detail: '@seraphthealchemist', href: 'https://www.venmo.com/seraphthealchemist' },
  { id: 'stripe', name: 'Stripe', detail: 'Open secure checkout', href: 'https://buy.stripe.com/cN23cmePvfGK4ow28e' },
] as const;

export type LiveItem = { id: string; title: string; amount: number };
export type LiveEntry = {
  id: string; name: string | null; email: string | null; items: LiveItem[];
  expected_amount: number; payment_method: string; payment_reference: string | null;
  status: 'waiting' | 'completed' | 'removed'; payment_status: 'unverified' | 'verified';
  created_at: string; acknowledged_at: string; terms_version: string; privacy_version: string;
  source: 'visitor' | 'admin'; entered_by: string | null;
};
export type LiveFormState = { ok: boolean; message: string };
