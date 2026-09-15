import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const client = await createClient();
  if (!client) return Response.json({ error: 'Booking is unavailable.' }, { status: 503 });
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) return Response.json({ error: 'Sign in to view appointment times.' }, { status: 401 });
  const service = new URL(request.url).searchParams.get('service')?.trim() ?? '';
  if (!/^[a-z0-9-]{2,120}$/.test(service)) return Response.json({ error: 'Choose a service first.' }, { status: 400 });
  const { data, error } = await client.rpc('available_booking_slots', { target_service: service });
  if (error) {
    console.error('[booking/slots] Slot lookup failed:', error.code, error.message);
    return Response.json({ error: 'Appointment times are being prepared.' }, { status: 503 });
  }
  return Response.json({ slots: data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}
