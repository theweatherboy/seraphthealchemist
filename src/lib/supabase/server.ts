import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';
import type { Database } from './database.types';

export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Proxy refreshes them before rendering.
          // Server actions and the callback route can write cookies normally.
        }
      },
    },
  });
}
