import { NextResponse, type NextRequest } from 'next/server';
import { getSiteOrigin } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') === '/admin' ? '/admin' : '/account';
  const client = await createClient();
  let authenticated = false;
  let failureReason = 'missing-code';
  if (client && code && !request.nextUrl.searchParams.has('error')) {
    try {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error) {
        failureReason = error.message.slice(0, 120);
        console.error('[auth/callback] Supabase exchange failed:', error.message);
      } else {
        authenticated = true;
      }
    } catch (error) {
      failureReason = error instanceof Error ? error.message.slice(0, 120) : 'exchange-failed';
      console.error('[auth/callback] Unexpected exchange failure:', failureReason);
    }
  }
  const failure = new URL('/login', getSiteOrigin());
  failure.searchParams.set('error', 'callback');
  // Keep browser errors generic; the server log contains the safe diagnostic.
  const response = NextResponse.redirect(authenticated ? new URL(next, getSiteOrigin()) : failure);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
