'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import { livePayments, type LiveFormState } from '@/lib/tiktok-live';

async function submit(form: FormData, manual: boolean): Promise<LiveFormState> {
  const client = manual ? (await requireAdmin()).client : await createClient();
  const fail = (message: string) => ({ ok: false, message });
  if (!client) return fail('The LIVE queue is unavailable. Please try again shortly.');
  if (form.get('terms') !== 'on' || form.get('privacy') !== 'on') return fail('Please agree to both the Terms of Service and Privacy Policy.');
  const firstName = String(form.get('first_name') ?? '').trim();
  const lastName = String(form.get('last_name') ?? '').trim();
  const payment = String(form.get('payment') ?? '');
  const id = String(form.get('request_id') ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return fail('Reload this page before trying again.');
  if (!firstName || !lastName || firstName.length > 60 || lastName.length > 60 || /[\u0000-\u001f\u007f]/.test(firstName + lastName)) return fail('Enter your first and last name.');
  if (!livePayments.some(method => method.id === payment)) return fail('Choose a payment method.');
  try {
    const { error } = await client.rpc('join_tiktok_live', {
      request_id: id, first_name: firstName, last_name: lastName, selected_payment: payment,
      accepted_terms: true, accepted_privacy: true, entry_source: manual ? 'admin' : 'visitor',
    });
    if (error) return fail(error.message.includes('Please wait') ? 'Please wait five minutes before sending another request.' : 'Your details could not be saved. Please try again.');
  } catch { return fail('Connection interrupted. Please try again with the same details.'); }
  revalidatePath('/admin/live');
  revalidatePath('/admin');
  return { ok: true, payment, message: manual ? 'Added to the LIVE queue. Payment needs verification.' : 'You’re in the LIVE queue. Use the link below to donate, then return to TikTok LIVE. Seraph will confirm your payment.' };
}

export async function submitLiveRequest(_state: LiveFormState, form: FormData) { return submit(form, false); }
export async function addManualLiveRequest(_state: LiveFormState, form: FormData) { return submit(form, true); }
