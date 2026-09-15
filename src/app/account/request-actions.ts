'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { services } from '@/data/services';
import { requireAccount } from '@/lib/supabase/session';

export async function submitServiceRequest(formData: FormData) {
  const { client } = await requireAccount();
  const slug = String(formData.get('service_slug') ?? '');
  const method = String(formData.get('payment_method') ?? '');
  const reference = String(formData.get('payment_reference') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim() || null;
  const contactPhone = String(formData.get('contact_phone') ?? '').trim() || null;
  const slotStart = String(formData.get('slot_start') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const service = services.find(item => item.slug === slug);
  // PostgREST returns timestamptz values with an offset (for example +00:00),
  // while browsers may submit an equivalent UTC value ending in Z.
  const validStart = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(slotStart) && !Number.isNaN(Date.parse(slotStart));
  if (!service || !['cash_app', 'paypal', 'venmo', 'stripe'].includes(method) || reference.length < 2 || reference.length > 120 || note && note.length > 1000 || contactPhone && (contactPhone.length < 7 || contactPhone.length > 40) || !validStart || !timezone || /[\u0000-\u001f\u007f]/.test(reference + (note ?? '') + (contactPhone ?? '') + timezone)) redirect(`/account?request=${encodeURIComponent(slug)}&error=request`);
  const { error } = await client.rpc('book_service_request', { target_service: service.slug, target_title: service.title, selected_start: slotStart, selected_timezone: timezone, selected_payment_method: method, selected_payment_reference: reference, selected_note: note, selected_phone: contactPhone });
  if (error) {
    console.error('[account/request] Submission failed:', error.code, error.message);
    redirect(`/account?request=${encodeURIComponent(slug)}&error=request`);
  }
  revalidatePath('/account');
  revalidatePath('/admin');
  redirect('/account?saved=request');
}
