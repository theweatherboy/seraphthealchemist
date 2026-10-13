'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';

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
