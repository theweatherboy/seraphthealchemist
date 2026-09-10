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
  const { client } = await requireAccount('/admin');
  const requestId = String(formData.get('request_id') ?? '');
  const status = String(formData.get('status') ?? '');
  const scheduledDate = String(formData.get('scheduled_date') ?? '').trim() || null;
  const scheduledTime = String(formData.get('scheduled_time') ?? '').trim() || null;
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const adminNote = String(formData.get('admin_note') ?? '').trim() || null;
  const statuses = ['pending', 'contacted', 'scheduled', 'completed', 'declined', 'canceled'];
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !statuses.includes(status) || adminNote && adminNote.length > 1000 || /[\u0000-\u001f\u007f]/.test((adminNote ?? '') + timezone)) redirect('/admin?error=request');
  let scheduledLocal: string | null = null;
  if (scheduledDate || scheduledTime) {
    if (!scheduledDate || !scheduledTime || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !/^\d{2}:\d{2}$/.test(scheduledTime)) redirect('/admin?error=request');
    scheduledLocal = `${scheduledDate}T${scheduledTime}:00`;
  }
  const { error } = await client.rpc('schedule_service_request', {
    target_request: requestId,
    next_status: status,
    scheduled_local: scheduledLocal,
    schedule_timezone: timezone,
    next_admin_note: adminNote,
  });
  if (error) {
    console.error('[admin/requests] Could not schedule request:', error.code, error.message);
    redirect('/admin?error=request');
  }
  revalidatePath('/admin'); revalidatePath('/account');
  redirect('/admin?saved=request');
}

const validClock = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const validTimezone = /^[A-Za-z0-9_+\-/]{3,80}$/;
const validUuid = /^[0-9a-f-]{36}$/i;

export async function addAvailabilityWindow(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const weekday = Number(formData.get('weekday'));
  const startsAt = String(formData.get('starts_at') ?? '').trim();
  const endsAt = String(formData.get('ends_at') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || !validClock.test(startsAt) || !validClock.test(endsAt) || startsAt >= endsAt || !validTimezone.test(timezone)) redirect('/admin?error=availability');
  const { error } = await client.from('scheduling_availability').insert({ weekday, starts_at: startsAt, ends_at: endsAt, timezone, is_enabled: true });
  if (error) {
    console.error('[admin/availability] Could not save availability:', error.code, error.message);
    redirect('/admin?error=availability');
  }
  revalidatePath('/admin');
  redirect('/admin?saved=availability');
}

export async function deleteAvailabilityWindow(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const id = String(formData.get('availability_id') ?? '');
  if (!validUuid.test(id)) redirect('/admin?error=availability');
  const { error } = await client.from('scheduling_availability').delete().eq('id', id);
  if (error) redirect('/admin?error=availability');
  revalidatePath('/admin');
  redirect('/admin?saved=availability');
}

export async function addSchedulingBlock(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const startsLocal = String(formData.get('starts_at') ?? '').trim();
  const endsLocal = String(formData.get('ends_at') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsLocal) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(endsLocal) || endsLocal <= startsLocal || !validTimezone.test(timezone) || reason.length < 2 || reason.length > 200 || /[\u0000-\u001f\u007f]/.test(reason)) redirect('/admin?error=block');
  const { error } = await client.rpc('create_scheduling_block', { starts_local: startsLocal, ends_local: endsLocal, schedule_timezone: timezone, block_reason: reason });
  if (error) {
    console.error('[admin/blocks] Could not save scheduling block:', error.code, error.message);
    redirect('/admin?error=block');
  }
  revalidatePath('/admin');
  redirect('/admin?saved=block');
}

export async function deleteSchedulingBlock(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const id = String(formData.get('block_id') ?? '');
  if (!validUuid.test(id)) redirect('/admin?error=block');
  const { error } = await client.from('scheduling_blocks').delete().eq('id', id);
  if (error) redirect('/admin?error=block');
  revalidatePath('/admin');
  redirect('/admin?saved=block');
}

export async function saveServiceSchedulePolicy(formData: FormData) {
  const { client, user } = await requireAccount('/admin');
  const serviceSlug = String(formData.get('service_slug') ?? '').trim();
  const durationMinutes = Number(formData.get('duration_minutes'));
  const bufferMinutes = Number(formData.get('buffer_minutes') ?? 0);
  const limit = (field: string, ceiling: number) => {
    const value = String(formData.get(field) ?? '').trim();
    if (!value) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= ceiling ? parsed : NaN;
  };
  const maxPerDay = limit('max_per_day', 100);
  const maxPerWeek = limit('max_per_week', 500);
  const maxPerMonth = limit('max_per_month', 2000);
  const service = services.find(item => item.slug === serviceSlug);
  if (!service || !Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480 || !Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 180 || [maxPerDay, maxPerWeek, maxPerMonth].some(Number.isNaN)) redirect('/admin?error=policy');
  const { error } = await client.from('service_schedule_policies').upsert({ service_slug: serviceSlug, duration_minutes: durationMinutes, buffer_minutes: bufferMinutes, max_per_day: maxPerDay, max_per_week: maxPerWeek, max_per_month: maxPerMonth, is_bookable: formData.get('is_bookable') === 'on', updated_by: user.id }, { onConflict: 'service_slug' });
  if (error) {
    console.error('[admin/policies] Could not save service policy:', error.code, error.message);
    redirect('/admin?error=policy');
  }
  revalidatePath('/admin');
  redirect('/admin?saved=policy');
}
