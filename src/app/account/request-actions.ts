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
  const service = services.find(item => item.slug === slug);
  if (!service || !['cash_app', 'paypal', 'venmo', 'stripe'].includes(method) || reference.length < 2 || reference.length > 120 || note && note.length > 1000 || /[\u0000-\u001f\u007f]/.test(reference + (note ?? ''))) redirect(`/account?request=${encodeURIComponent(slug)}&error=request`);
  const { error } = await client.from('service_requests').insert({ customer_id: user.id, service_slug: service.slug, service_title: service.title, payment_method: method as 'cash_app' | 'paypal' | 'venmo' | 'stripe', payment_reference: reference, note });
  if (error) {
    console.error('[account/request] Submission failed:', error.code, error.message);
    redirect(`/account?request=${encodeURIComponent(slug)}&error=request`);
  }
  revalidatePath('/account');
  revalidatePath('/admin');
  redirect('/account?saved=request');
}
