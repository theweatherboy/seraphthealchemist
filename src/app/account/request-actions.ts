'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { services } from '@/data/services';
import { requireAccount } from '@/lib/supabase/session';

export async function submitServiceRequest(formData: FormData) {
  const { client, user } = await requireAccount();
  const slug = String(formData.get('service_slug') ?? '');
  const method = String(formData.get('payment_method') ?? '');
  const reference = String(formData.get('payment_reference') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim() || null;
  const contactPhone = String(formData.get('contact_phone') ?? '').trim() || null;
  const preferredDate = String(formData.get('preferred_date') ?? '').trim() || null;
  const preferredTime = String(formData.get('preferred_time') ?? '').trim() || null;
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const service = services.find(item => item.slug === slug);
  const validDate = !preferredDate || /^\d{4}-\d{2}-\d{2}$/.test(preferredDate);
  const validTime = !preferredTime || /^\d{2}:\d{2}$/.test(preferredTime);
  if (!service || !['cash_app', 'paypal', 'venmo', 'stripe'].includes(method) || reference.length < 2 || reference.length > 120 || note && note.length > 1000 || contactPhone && (contactPhone.length < 7 || contactPhone.length > 40) || !validDate || !validTime || !timezone || /[\u0000-\u001f\u007f]/.test(reference + (note ?? '') + (contactPhone ?? '') + timezone)) redirect(`/account?request=${encodeURIComponent(slug)}&error=request`);
  const { error } = await client.from('service_requests').insert({ customer_id: user.id, service_slug: service.slug, service_title: service.title, payment_method: method as 'cash_app' | 'paypal' | 'venmo' | 'stripe', payment_reference: reference, note, contact_email: user.email ?? null, contact_phone: contactPhone, preferred_date: preferredDate, preferred_time: preferredTime, timezone });
  if (error) {
    console.error('[account/request] Submission failed:', error.code, error.message);
    redirect(`/account?request=${encodeURIComponent(slug)}&error=request`);
  }
  revalidatePath('/account');
  revalidatePath('/admin');
  redirect('/account?saved=request');
}
