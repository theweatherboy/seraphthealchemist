import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseBirthProfile } from '@/lib/birth-profile';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers });
const unavailable = () => json({ error: 'Saving birth details is temporarily unavailable. You can still calculate a chart without saving.' }, 503);

export async function GET() {
  const client = await createClient();
  if (!client) return json({ signedIn: false, profile: null });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return json({ signedIn: false, profile: null });
  const { data, error } = await client.from('birth_profiles').select('birth_date,birth_time,place_label,latitude,longitude,timezone').eq('user_id', user.id).maybeSingle();
  if (error) return unavailable();
  return json({ signedIn: true, accountId: user.id, profile: data ? { date: data.birth_date, time: data.birth_time.slice(0, 5), place: { label: data.place_label, lat: data.latitude, lon: data.longitude }, timezone: data.timezone } : null });
}

async function mutate(request: Request, remove: boolean) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Please manage birth details on this website.' }, 403);
  const client = await createClient();
  if (!client) return unavailable();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return json({ error: 'Please sign in again to manage your saved birth details.' }, 401);
  if (request.headers.get('x-birth-profile-account') !== user.id) return json({ error: 'Your signed-in account changed. Reload this page before managing saved details.' }, 409);
  if (remove) {
    const { error } = await client.from('birth_profiles').delete().eq('user_id', user.id);
    return error ? unavailable() : json({ deleted: true });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Expected a JSON request.' }, 415);
  let details;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Enter your birth details before saving.' }, 400);
    let size = 0, content = '';
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return json({ error: 'The request is too large.' }, 413); }
      content += decoder.decode(value, { stream: true });
    }
    content += decoder.decode();
    details = parseBirthProfile(JSON.parse(content));
  } catch (error) { return json({ error: error instanceof SyntaxError ? 'The request could not be read.' : error instanceof Error ? error.message : 'Invalid birth details.' }, 400); }
  const now = new Date().toISOString();
  const { error } = await client.from('birth_profiles').upsert({ user_id: user.id, birth_date: details.date, birth_time: details.time, place_label: details.place.label, latitude: details.place.lat, longitude: details.place.lon, timezone: details.timezone, storage_consent: true, consent_version: 'birth-details-v1', consent_granted_at: now, updated_at: now }, { onConflict: 'user_id' });
  return error ? unavailable() : json({ saved: true, profile: details });
}
export function PUT(request: Request) { return mutate(request, false); }
export function DELETE(request: Request) { return mutate(request, true); }
