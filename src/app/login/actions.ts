'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSiteOrigin } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { AUTH_RETURN_COOKIE, authReturnPath } from '@/lib/auth-return';

export async function signInWithGoogle(form: FormData) {
  const next = authReturnPath(form.get('next'));
  const failure = next === '/account' ? '/login?error=unavailable' : `/login?error=unavailable&next=${encodeURIComponent(next)}`;
  const client = await createClient();
  if (!client) redirect(failure);
  const callback = new URL('/auth/callback', getSiteOrigin());
  const cookieStore = await cookies();
  cookieStore.set(AUTH_RETURN_COOKIE, next, {
    httpOnly: true, sameSite: 'lax', secure: callback.protocol === 'https:',
    path: '/', maxAge: 600,
  });
  let destination: string | undefined;
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (!error) destination = data.url ?? undefined;
  } catch { /* Display a fixed message rather than provider details or tokens. */ }
  if (!destination) {
    cookieStore.delete(AUTH_RETURN_COOKIE);
    redirect(failure);
  }
  redirect(destination);
}

export async function signOut() {
  (await cookies()).delete(AUTH_RETURN_COOKIE);
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
