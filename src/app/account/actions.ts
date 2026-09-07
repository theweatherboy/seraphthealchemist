'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/supabase/session';

export async function updateProfile(formData: FormData) {
  const { client, user } = await requireAccount();
  const input = formData.get('display_name');
  const displayName = typeof input === 'string' ? input.trim() : '';
  if (displayName.length < 2 || displayName.length > 60 || /[\u0000-\u001f\u007f]/.test(displayName)) {
    redirect('/account?error=name');
  }
  // Owner ID comes from a verified session, never from form input.
  const { data, error } = await client.from('profiles').update({ display_name: displayName }).eq('id', user.id).select('id').maybeSingle();
  if (error || !data) redirect('/account?error=save');
  revalidatePath('/account');
  redirect('/account?saved=1');
}
