'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/supabase/session';
import { getServices } from '@/lib/services';
import { requireAdmin } from '@/lib/admin';
import { defaultNavigation } from '@/lib/navigation';

export async function updateNavigationVisibility(formData: FormData) {
  const { client } = await requireAdmin();
  const href = String(formData.get('href') ?? '');
  const value = formData.get('is_visible');
  if (!defaultNavigation.some(item => item.href === href) || href === '/terms-of-service' || href === '/privacy-policy' || !['true', 'false'].includes(String(value))) return { ok: false as const, error: 'This menu setting cannot be changed.' };
  const { data, error } = await client.from('navigation_visibility').update({ is_visible: value === 'true' }).eq('href', href).select('is_visible').single();
  if (error || !data) return { ok: false as const, error: 'Menu visibility could not be saved. Please try again.' };
  revalidatePath('/'); revalidatePath('/admin', 'layout');
  return { ok: true as const, visible: data.is_visible as boolean };
}

export async function saveService(formData: FormData) {
  const { client } = await requireAdmin();
  const slug = String(formData.get('slug') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const duration = String(formData.get('duration') ?? '').trim();
  const priceText = String(formData.get('price') ?? '').trim();
  const price = Number(priceText);
  const services = await getServices();
  if (!services.some(service => service.slug === slug) ||
      title.length < 2 || title.length > 120 || subtitle.length < 2 || subtitle.length > 200 ||
      description.length < 10 || description.length > 3000 || duration.length < 2 || duration.length > 80 ||
      !/^\d+(\.\d{1,2})?$/.test(priceText) || !Number.isFinite(price) || price < 0 || price > 999999) {
    redirect('/admin/services?error=catalog');
  }
  const { error } = await client.from('service_catalog').upsert({ slug, title, subtitle, description, price, duration });
  if (error) redirect('/admin/services?error=catalog');
  revalidatePath('/services', 'layout');
  revalidatePath('/account');
  revalidatePath('/admin', 'layout');
  redirect('/admin/services?saved=catalog');
}

export async function addServiceInstance(formData: FormData) {
  const { client, user } = await requireAdmin();
  const customerId = String(formData.get('customer_id') ?? '');
  const slug = String(formData.get('service_slug') ?? '').trim();
  const completedAt = String(formData.get('completed_at') ?? '');
  const services = await getServices();
  const service = services.find(item => item.slug === slug);
  const completedDate = new Date(`${completedAt}T00:00:00Z`);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (!/^[0-9a-f-]{36}$/i.test(customerId) || !service || !/^\d{4}-\d{2}-\d{2}$/.test(completedAt) ||
      Number.isNaN(completedDate.getTime()) || completedDate.toISOString().slice(0, 10) !== completedAt || completedAt > today) redirect('/admin/testimonies?error=service');
  const { error } = await client.from('service_instances').insert({ customer_id: customerId, service_slug: service.slug, service_title: service.title, completed_at: completedAt, verified_by: user.id });
  if (error) {
    console.error('[admin/service] Could not verify service:', error.code, error.message);
    redirect('/admin/testimonies?error=service');
  }
  revalidatePath('/admin', 'layout'); revalidatePath('/account');
  redirect('/admin/testimonies?saved=service');
}

export async function moderateReview(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const reviewId = String(formData.get('review_id') ?? '');
  const revisionId = String(formData.get('revision_id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  const reason = String(formData.get('reason') ?? '').trim() || null;
  const { error } = await client.rpc('moderate_review', { target_review: reviewId, target_revision: revisionId, decision, reason });
  if (error) redirect('/admin/testimonies?error=moderation');
  revalidatePath('/admin', 'layout'); revalidatePath('/reviews');
  redirect('/admin/testimonies?saved=moderation');
}

export async function updateServiceRequest(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const requestId = String(formData.get('request_id') ?? '');
  const status = String(formData.get('status') ?? '');
  const paymentStatus = String(formData.get('payment_status') ?? '').trim() || null;
  const scheduledDate = String(formData.get('scheduled_date') ?? '').trim() || null;
  const scheduledTime = String(formData.get('scheduled_time') ?? '').trim() || null;
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const adminNote = String(formData.get('admin_note') ?? '').trim() || null;
  const returnTo = String(formData.get('return_to') ?? '') === `/admin/scheduling?request=${requestId}` ? `/admin/scheduling?request=${requestId}` : '/admin';
  const statuses = ['pending', 'contacted', 'scheduled', 'completed', 'declined', 'canceled'];
  const paymentStatuses = ['awaiting_verification', 'verified', 'declined', 'refunded'];
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !statuses.includes(status) || paymentStatus && !paymentStatuses.includes(paymentStatus) || adminNote && adminNote.length > 1000 || /[\u0000-\u001f\u007f]/.test((adminNote ?? '') + timezone)) redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=request`);
  let scheduledLocal: string | null = null;
  if (scheduledDate || scheduledTime) {
    if (!scheduledDate || !scheduledTime || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !/^\d{2}:\d{2}$/.test(scheduledTime)) redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=request`);
    scheduledLocal = `${scheduledDate}T${scheduledTime}:00`;
  }
  const { error } = await client.rpc('schedule_service_request', {
    target_request: requestId,
    next_status: status,
    scheduled_local: scheduledLocal,
    schedule_timezone: timezone,
    next_admin_note: adminNote,
    next_payment_status: paymentStatus,
  });
  if (error) {
    console.error('[admin/requests] Could not schedule request:', error.code, error.message);
    redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=request`);
  }
  revalidatePath('/admin', 'layout'); revalidatePath('/admin/scheduling'); revalidatePath('/account');
  redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}saved=request`);
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
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || !validClock.test(startsAt) || !validClock.test(endsAt) || startsAt >= endsAt || !validTimezone.test(timezone)) redirect('/admin/services?error=availability');
  const { error } = await client.from('scheduling_availability').insert({ weekday, starts_at: startsAt, ends_at: endsAt, timezone, is_enabled: true });
  if (error) {
    console.error('[admin/availability] Could not save availability:', error.code, error.message);
    redirect('/admin/services?error=availability');
  }
  revalidatePath('/admin', 'layout');
  redirect('/admin/services?saved=availability');
}

export async function deleteAvailabilityWindow(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const id = String(formData.get('availability_id') ?? '');
  if (!validUuid.test(id)) redirect('/admin/services?error=availability');
  const { error } = await client.from('scheduling_availability').delete().eq('id', id);
  if (error) redirect('/admin/services?error=availability');
  revalidatePath('/admin', 'layout');
  redirect('/admin/services?saved=availability');
}

export async function addSchedulingBlock(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const startsLocal = String(formData.get('starts_at') ?? '').trim();
  const endsLocal = String(formData.get('ends_at') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Chicago').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsLocal) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(endsLocal) || endsLocal <= startsLocal || !validTimezone.test(timezone) || reason.length < 2 || reason.length > 200 || /[\u0000-\u001f\u007f]/.test(reason)) redirect('/admin/services?error=block');
  const { error } = await client.rpc('create_scheduling_block', { starts_local: startsLocal, ends_local: endsLocal, schedule_timezone: timezone, block_reason: reason });
  if (error) {
    console.error('[admin/blocks] Could not save scheduling block:', error.code, error.message);
    redirect('/admin/services?error=block');
  }
  revalidatePath('/admin', 'layout');
  redirect('/admin/services?saved=block');
}

export async function deleteSchedulingBlock(formData: FormData) {
  const { client } = await requireAccount('/admin');
  const id = String(formData.get('block_id') ?? '');
  if (!validUuid.test(id)) redirect('/admin/services?error=block');
  const { error } = await client.from('scheduling_blocks').delete().eq('id', id);
  if (error) redirect('/admin/services?error=block');
  revalidatePath('/admin', 'layout');
  redirect('/admin/services?saved=block');
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
  const services = await getServices();
  const service = services.find(item => item.slug === serviceSlug);
  if (!service || !Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480 || !Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 180 || [maxPerDay, maxPerWeek, maxPerMonth].some(Number.isNaN)) redirect('/admin/services?error=policy');
  const { error } = await client.from('service_schedule_policies').upsert({ service_slug: serviceSlug, duration_minutes: durationMinutes, buffer_minutes: bufferMinutes, max_per_day: maxPerDay, max_per_week: maxPerWeek, max_per_month: maxPerMonth, is_bookable: formData.get('is_bookable') === 'on', updated_by: user.id }, { onConflict: 'service_slug' });
  if (error) {
    console.error('[admin/policies] Could not save service policy:', error.code, error.message);
    redirect('/admin/services?error=policy');
  }
  revalidatePath('/admin', 'layout');
  redirect('/admin/services?saved=policy');
}
