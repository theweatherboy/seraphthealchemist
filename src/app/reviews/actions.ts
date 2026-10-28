'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function submitGuestReview(formData: FormData) {
  if (formData.get('website')) redirect('/reviews?submitted=1');
  const firstName = String(formData.get('first_name') ?? '').trim();
  const lastName = String(formData.get('last_name') ?? '').trim();
  const serviceTitle = String(formData.get('service_title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const ratingText = String(formData.get('rating') ?? '');
  const validText = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);
  if (!firstName || firstName.length > 60 || !lastName || lastName.length > 60 || serviceTitle.length > 120 ||
      body.length < 20 || body.length > 1600 || !validText(firstName) || !validText(lastName) ||
      !validText(serviceTitle) || !validText(body) || !/^[1-5]$/.test(ratingText)) {
    redirect('/reviews?error=review#leave-a-review');
  }
  const client = await createClient();
  if (!client) redirect('/reviews?error=unavailable#leave-a-review');
  const { error } = await client.rpc('submit_guest_review', {
    guest_first_name: firstName, guest_last_name: lastName,
    guest_service_title: serviceTitle, guest_rating: Number(ratingText), guest_body: body,
  });
  if (error) {
    console.error('[reviews/guest] Submission failed:', error.code);
    redirect('/reviews?error=unavailable#leave-a-review');
  }
  redirect('/reviews?submitted=1#leave-a-review');
}
