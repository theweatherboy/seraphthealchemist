import tzLookup from '@photostructure/tz-lookup';

export type BirthDetails = { date: string; time: string; place: { label: string; lat: number; lon: number }; timezone?: string };

export function parseBirthProfile(value: unknown): BirthDetails & { timezone: string } {
  if (!value || typeof value !== 'object') throw new Error('Enter your birth details before saving.');
  const input = value as Record<string, unknown>;
  if (input.consent !== true) throw new Error('Select the permission checkbox before saving your birth details.');
  const date = typeof input.date === 'string' ? input.date : '';
  const time = typeof input.time === 'string' ? input.time : '';
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || date < '1900-01-01' || date > new Date().toISOString().slice(0, 10) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Enter a valid birth date and local birth time before saving.');
  const place = input.place as Record<string, unknown> | null;
  if (!place || typeof place !== 'object' || typeof place.label !== 'string' || !place.label.trim() || place.label.length > 300 || /[\u0000-\u001f]/.test(place.label) || typeof place.lat !== 'number' || !Number.isFinite(place.lat) || Math.abs(place.lat) > 90 || typeof place.lon !== 'number' || !Number.isFinite(place.lon) || Math.abs(place.lon) > 180) throw new Error('Search for your birth city and select a matching place before saving.');
  return { date, time, place: { label: place.label.trim(), lat: place.lat, lon: place.lon }, timezone: tzLookup(place.lat, place.lon) };
}
