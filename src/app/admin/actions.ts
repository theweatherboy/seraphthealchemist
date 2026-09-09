'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/supabase/session';
import { services } from '@/data/services';

export async function addServiceInstance(formData: FormData) {
  const { client, user } = await requireAccount('/admin');
  const customerId = String(formData.get('customer_id') ?? '');
  const slug = String(formData.get('service_slug') ?? '').trim();
  const completedAt = String(formData.get('completed_at') ?? '');
  const service = services.find(item => item.slug === slug);
  if (!/^[0-9a-f-]{36}$/i.test(customerId) || !service || !/^\d{4}-\d{2}-\d{2}$/.test(completedAt)) redirect('/admin?error=service');
  const { error } = await client.from('service_instances').insert({ customer_id: customerId, service_slug: service.slug, service_title: service.title, completed_at: completedAt, verified_by: user.id });
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

export async function updateServiceRequest(formData: FormData) {
  const { client, user } = await requireAccount('/admin');
  const requestId = String(formData.get('request_id') ?? '');
  const status = String(formData.get('status') ?? '');
  const scheduledDate = String(formData.get('scheduled_date') ?? '').trim() || null;
  const scheduledTime = String(formData.get('scheduled_time') ?? '').trim() || null;
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const adminNote = String(formData.get('admin_note') ?? '').trim() || null;
  const statuses = ['pending', 'contacted', 'scheduled', 'completed', 'declined', 'canceled'];
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !statuses.includes(status) || adminNote && adminNote.length > 1000 || /[\u0000-\u001f\u007f]/.test((adminNote ?? '') + timezone)) redirect('/admin?error=request');
  let scheduledAt: string | null = null;
  if (scheduledDate || scheduledTime) {
    if (!scheduledDate || !scheduledTime || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !/^\d{2}:\d{2}$/.test(scheduledTime)) redirect('/admin?error=request');
    scheduledAt = `${scheduledDate}T${scheduledTime}:00`;
  }
  const { error } = await client.from('service_requests').update({ status: status as 'pending' | 'contacted' | 'scheduled' | 'completed' | 'declined' | 'canceled', scheduled_at: scheduledAt, timezone, admin_note: adminNote, reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', requestId);
  if (error) {
    console.error('[admin/requests] Could not update request:', error.code, error.message);
    redirect('/admin?error=request');
  }
  revalidatePath('/admin'); revalidatePath('/account');
  redirect('/admin?saved=request');
}
