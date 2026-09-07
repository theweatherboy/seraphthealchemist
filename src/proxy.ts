import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/config';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store');
  const config = getSupabaseConfig();
  if (!config) return response;

  const client = createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        response.headers.set('Cache-Control', 'private, no-store');
      },
    },
  });
  // This verifies/refreshes the token; individual pages and actions still authorize access.
  try { await client.auth.getClaims(); } catch { /* Protected pages fail closed via getUser(). */ }
  return response;
}

export const config = { matcher: ['/login', '/account/:path*', '/admin/:path*'] };
