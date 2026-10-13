'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import { liveOfferings, livePayments, type LiveFormState } from '@/lib/tiktok-live';

async function submit(form: FormData, manual: boolean): Promise<LiveFormState> {
  const client = manual ? (await requireAdmin()).client : await createClient();
  const fail = (message: string) => ({ ok: false, message });
  if (!client) return fail('The LIVE queue is unavailable. Please try again shortly.');
  if (form.get('terms') !== 'on' || form.get('privacy') !== 'on' || form.get('confirmed') !== 'on') return fail('Confirm your details and acknowledge both the Terms of Service and Privacy Policy.');
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const reference = String(form.get('reference') ?? '').trim();
  const services = form.getAll('services').map(String);
  const extra = form.get('extra') === 'on';
  const payment = String(form.get('payment') ?? '');
  const id = String(form.get('request_id') ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return fail('Reload this page before trying again.');
  if ((!name && !email) || name.length > 120 || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || reference.length > 120 || /[\u0000-\u001f\u007f]/.test(name + email + reference)) return fail('Enter your name or a valid email address.');
  if (!services.length || services.length > 5 || new Set(services).size !== services.length || services.some(id => !liveOfferings.some(item => item.id === id)) || (extra && !services.includes('guidance')) || !livePayments.some(item => item.id === payment)) return fail('Choose your LIVE offerings and payment method.');
  try {
    const { error } = await client.rpc('submit_tiktok_live', {
      request_id: id, contact_name: name, contact_email: email, selected_services: services,
      extra_time: extra, selected_payment: payment, payment_reference: reference,
      accepted_terms: true, accepted_privacy: true, confirmed: true, entry_source: manual ? 'admin' : 'visitor',
    });
    if (error) return fail(error.message.includes('Please wait') ? 'Please wait five minutes before sending another request.' : 'Your request could not be saved. Please try again; no confirmation has been recorded here.');
  } catch { return fail('Connection interrupted. Please try again with the same details.'); }
  revalidatePath('/admin/live');
  revalidatePath('/admin');
  return { ok: true, message: manual ? 'Added to the LIVE queue. Payment needs verification.' : 'You’re in the LIVE queue! Return to TikTok LIVE. Seraph will check your donation.' };
}

export async function submitLiveRequest(_state: LiveFormState, form: FormData) { return submit(form, false); }
export async function addManualLiveRequest(_state: LiveFormState, form: FormData) { return submit(form, true); }
