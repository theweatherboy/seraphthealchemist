'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/supabase/session';

export async function addServiceInstance(formData: FormData) {
  const { client, user } = await requireAccount('/admin');
  const customerId = String(formData.get('customer_id') ?? '');
  const title = String(formData.get('service_title') ?? '').trim();
  const slug = String(formData.get('service_slug') ?? '').trim();
  const completedAt = String(formData.get('completed_at') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(customerId) || !title || !slug || !/^\d{4}-\d{2}-\d{2}$/.test(completedAt)) redirect('/admin?error=service');
  const { error } = await client.from('service_instances').insert({ customer_id: customerId, service_slug: slug, service_title: title, completed_at: completedAt, verified_by: user.id });
  if (error) {
    console.error('[admin/service] Could not verify service:', error.code, error.message);
    redirect('/admin?error=service');
  }
  revalidatePath('/admin'); revalidatePath('/account');
  redirect('/admin?saved=service');
}

export async function moderateReview(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const reviewId = String(formData.get('review_id') ?? '');
  const revisionId = String(formData.get('revision_id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  const reason = String(formData.get('reason') ?? '').trim() || null;
  const { error } = await client.rpc('moderate_review', { target_review: reviewId, target_revision: revisionId, decision, reason });
  if (error) redirect('/admin?error=moderation');
  revalidatePath('/admin'); revalidatePath('/reviews');
  redirect('/admin?saved=moderation');
}
