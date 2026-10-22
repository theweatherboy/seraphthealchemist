'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { livePayments } from '@/lib/tiktok-live';

export async function saveLivePayment(form: FormData) {
  const { client } = await requireAdmin();
  const id = String(form.get('id') ?? '');
  const amount = String(form.get('amount') ?? '').trim();
  const payment = String(form.get('payment') ?? '');
  const operation = String(form.get('operation') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{1,8}(\.\d{1,2})?$/.test(amount)
    || !livePayments.some(method => method.id === payment) || !['save', 'confirm'].includes(operation)) redirect('/admin/live?error=invalid');
  const { data, error } = await client.from('tiktok_live_queue').update({
    donated_amount: Number(amount), payment_method: payment,
    payment_status: operation === 'confirm' ? 'verified' : 'unverified',
  }).eq('id', id).select('id').maybeSingle();
  if (error || !data) redirect('/admin/live?error=save');
  revalidatePath('/admin/live');
  revalidatePath('/admin');
}

export async function updateLiveEntry(form: FormData) {
  const { client } = await requireAdmin();
  const id = String(form.get('id') ?? '');
  const operation = String(form.get('operation') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['completed', 'removed', 'waiting', 'verified', 'unverified'].includes(operation)) redirect('/admin/live?error=invalid');
  const change = operation === 'verified' || operation === 'unverified'
    ? { payment_status: operation as 'verified' | 'unverified' }
    : { status: operation as 'waiting' | 'completed' | 'removed' };
  const { data, error } = await client.from('tiktok_live_queue').update(change).eq('id', id).select('id').maybeSingle();
  if (error || !data) redirect('/admin/live?error=save');
  revalidatePath('/admin/live');
  revalidatePath('/admin');
}
