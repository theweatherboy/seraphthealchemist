'use server';

import { redirect } from 'next/navigation';
import { getSiteOrigin } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { authReturnPath } from '@/lib/auth-return';

export async function signInWithGoogle(form: FormData) {
  const next = authReturnPath(form.get('next'));
  const failure = next === '/account' ? '/login?error=unavailable' : `/login?error=unavailable&next=${encodeURIComponent(next)}`;
  const client = await createClient();
  if (!client) redirect(failure);
  const callback = new URL('/auth/callback', getSiteOrigin());
  if (next !== '/account') callback.searchParams.set('next', next);
  let destination: string | undefined;
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (!error) destination = data.url ?? undefined;
  } catch { /* Display a fixed message rather than provider details or tokens. */ }
  if (!destination) redirect(failure);
  redirect(destination);
}

export async function signOut() {
  const client = await createClient();
  let failed = false;
  if (client) {
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      failed = !!error;
    } catch { failed = true; }
  }
  if (failed) redirect('/account?error=signout');
  redirect('/login?message=signed-out');
}
