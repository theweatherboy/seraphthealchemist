'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/supabase/session';

export async function submitReview(formData: FormData) {
  const { client } = await requireAccount();
  const instanceId = String(formData.get('service_instance_id') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  const rating = Number(formData.get('rating') ?? 0);
  if (!/^[0-9a-f-]{36}$/i.test(instanceId) || body.length < 20 || body.length > 1600 || rating < 1 || rating > 5 || /[\u0000-\u001f\u007f]/.test(body)) {
    redirect('/account?error=review');
  }
  const { error } = await client.rpc('submit_review', { instance_id: instanceId, review_body: body, review_rating: rating });
  if (error) {
    console.error('[review/submit] RPC failed:', error.code, error.message);
    redirect('/account?error=review');
  }
  revalidatePath('/account');
  revalidatePath('/reviews');
  redirect('/account?saved=review');
}
