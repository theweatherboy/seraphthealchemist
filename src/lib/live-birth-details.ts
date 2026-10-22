export type LiveBirthDetails = { date: string; time: string; place: { label: string; lat: number; lon: number } | null };

export function parseLiveBirthDetails(form: FormData): LiveBirthDetails {
  const date = String(form.get('date') ?? '').trim();
  const time = String(form.get('time') ?? '').trim();
  const label = String(form.get('city') ?? '').trim();
  const latitude = String(form.get('birth_latitude') ?? '').trim();
  const longitude = String(form.get('birth_longitude') ?? '').trim();
  if (date) {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < '1900-01-01' || date > new Date().toISOString().slice(0, 10)) throw new Error('Enter a valid birth date, or leave it blank.');
  }
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Enter a valid local birth time, or leave it blank.');
  let place: LiveBirthDetails['place'] = null;
  if (label || latitude || longitude) {
    const lat = Number(latitude), lon = Number(longitude);
    if (!label || label.length > 300 || /[\u0000-\u001f\u007f]/.test(label) || !latitude || !longitude || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) throw new Error('Select a matching birth city, or clear the birthplace.');
    place = { label, lat, lon };
  }
  return { date, time, place };
}
