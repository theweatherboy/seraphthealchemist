import { Body, Ecliptic, EclipticGeoMoon, GeoVector } from 'astronomy-engine';
import tzLookup from '@photostructure/tz-lookup';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Place = { lat?: string; lon?: string; display_name?: string };
type Planet = { lon: number; lat?: number; dist?: number; speed_lon: number; retrograde: boolean; signIndex: number; sign: string; degInSign: number; house: number | null; dignity?: string };
type NatalChart = {
  houseSystem: string;
  ascendant: number;
  midheaven: number;
  cusps: number[];
  planets: Record<string, Planet>;
  aspects: { a: string; b: string; type: string; angle: number; delta: number; applying: boolean }[];
  partOfFortune?: { lon: number; signIndex: number; sign: string; degInSign: number; house: number };
};
type Transit = { kind: 'aspect'; date: string; exactAt: string; body: string; target: string; aspect: string; exactness: number; significance: string; phase: string };

const GEO_API = 'https://api.cosmyday.com';
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const MOVING_BODIES = [
  { name: 'Sun', body: Body.Sun }, { name: 'Moon', body: Body.Moon }, { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus }, { name: 'Mars', body: Body.Mars }, { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn }, { name: 'Uranus', body: Body.Uranus }, { name: 'Neptune', body: Body.Neptune },
  { name: 'Pluto', body: Body.Pluto },
];
const ASPECTS = [
  { name: 'Conjunction', degrees: [0] }, { name: 'Sextile', degrees: [60, 300] },
  { name: 'Square', degrees: [90, 270] }, { name: 'Trine', degrees: [120, 240] },
  { name: 'Quincunx', degrees: [150, 210] }, { name: 'Opposition', degrees: [180] },
];
const placeCache = new Map<string, { saved: number; places: Place[] }>();
let geocodeQueue = Promise.resolve();
let lastGeocodeAt = 0;

function normalize(longitude: number) { return ((longitude % 360) + 360) % 360; }
function signedAngle(angle: number) { return ((angle + 540) % 360) - 180; }

function zodiac(longitude: number) {
  const value = normalize(longitude);
  const degree = value % 30;
  const wholeDegrees = Math.floor(degree);
  const minutes = Math.floor((degree - wholeDegrees) * 60);
  return `${SIGNS[Math.floor(value / 30)]} ${String(wholeDegrees).padStart(2, '0')}°${String(minutes).padStart(2, '0')}′`;
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }

async function searchPlaces(query: string): Promise<Place[]> {
  const key = query.toLocaleLowerCase();
  const cached = placeCache.get(key);
  if (cached && Date.now() - cached.saved < 1000 * 60 * 60 * 24 * 30) return cached.places;

  let release!: () => void;
  const previous = geocodeQueue;
  geocodeQueue = new Promise<void>(resolve => { release = resolve; });
  await previous;
  try {
    const delay = Math.max(0, 1000 - (Date.now() - lastGeocodeAt));
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    const response = await fetch(`${GEO_API}/search-location?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'SeraphTheAlchemist/1.0 (birth-chart feature)' }, cache: 'no-store' });
    if (!response.ok) throw new Error('Location search is temporarily unavailable. Please try again shortly.');
    const value: unknown = await response.json();
    const records = Array.isArray(value) ? value : value && typeof value === 'object' && 'results' in value && Array.isArray((value as { results: unknown }).results) ? (value as { results: unknown[] }).results : [];
    const places = records.filter((place): place is Place => Boolean(place && typeof place === 'object' && 'lat' in place && 'lon' in place && Number.isFinite(Number((place as Place).lat)) && Number.isFinite(Number((place as Place).lon))));
    lastGeocodeAt = Date.now();
    placeCache.set(key, { saved: lastGeocodeAt, places });
    return places;
  } finally {
    release();
  }
}

function longitudeOf(body: (typeof MOVING_BODIES)[number]['body'], time: Date) {
  if (body === Body.Moon) return EclipticGeoMoon(time).lon;
  return Ecliptic(GeoVector(body, time, true)).elon;
}

function localDateTime(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, exactAt: new Date(timestamp).toISOString() };
}

function calculateTransits(chart: NatalChart, start: Date, end: Date, timezone: string): Transit[] {
  const targets: { name: string; longitude: number }[] = Object.entries(chart.planets)
    .filter((entry): entry is [string, Planet] => Number.isFinite(entry[1]?.lon))
    .map(([name, planet]) => ({ name, longitude: planet.lon }));
  if (chart.partOfFortune && !targets.some(target => target.name === 'PartOfFortune')) targets.push({ name: 'PartOfFortune', longitude: chart.partOfFortune.lon });
  targets.push({ name: 'Ascendant', longitude: chart.ascendant }, { name: 'Midheaven', longitude: chart.midheaven });

  // Twelve-hour brackets find direct and retrograde passes; bisection refines each hit to a minute.
  const step = 12 * 60 * 60 * 1000;
  const timestamps: number[] = [start.getTime()];
  while (timestamps[timestamps.length - 1] < end.getTime()) timestamps.push(Math.min(timestamps[timestamps.length - 1] + step, end.getTime()));
  const longitudes = new Map<string, number[]>();
  for (const moving of MOVING_BODIES) longitudes.set(moving.name, timestamps.map(timestamp => longitudeOf(moving.body, new Date(timestamp))));

  const output: Transit[] = [];
  const known = new Set<string>();
  for (const moving of MOVING_BODIES) {
    const positions = longitudes.get(moving.name)!;
    for (const target of targets) {
      const relative = positions.map(position => normalize(position - target.longitude));
      const unwrapped = [relative[0]];
      for (let index = 1; index < relative.length; index += 1) unwrapped.push(unwrapped[index - 1] + signedAngle(relative[index] - relative[index - 1]));

      for (const aspect of ASPECTS) for (const orientedDegree of aspect.degrees) {
        for (let index = 1; index < unwrapped.length; index += 1) {
          const leftValue = unwrapped[index - 1], rightValue = unwrapped[index];
          const min = Math.min(leftValue, rightValue), max = Math.max(leftValue, rightValue);
          const firstLevel = Math.ceil((min - orientedDegree) / 360);
          const lastLevel = Math.floor((max - orientedDegree) / 360);
          for (let turn = firstLevel; turn <= lastLevel; turn += 1) {
            const level = orientedDegree + turn * 360;
            if (level < min - 1e-9 || level > max + 1e-9) continue;
            let leftTime = timestamps[index - 1], rightTime = timestamps[index];
            let leftUnwrapped = leftValue;
            const increasing = rightValue > leftValue;
            let exactTime: number;
            if (Math.abs(level - leftValue) < 1e-9) exactTime = leftTime;
            else if (Math.abs(level - rightValue) < 1e-9) exactTime = rightTime;
            else {
              while (rightTime - leftTime > 30_000) {
                const middleTime = Math.floor((leftTime + rightTime) / 2);
                const middleRelative = normalize(longitudeOf(moving.body, new Date(middleTime)) - target.longitude);
                const middleUnwrapped = leftUnwrapped + signedAngle(middleRelative - normalize(leftUnwrapped));
                if ((increasing && middleUnwrapped < level) || (!increasing && middleUnwrapped > level)) {
                  leftTime = middleTime;
                  leftUnwrapped = middleUnwrapped;
                } else rightTime = middleTime;
              }
              exactTime = Math.floor((leftTime + rightTime) / 2);
            }
            const local = localDateTime(exactTime, timezone);
            const key = `${moving.name}|${target.name}|${aspect.name}|${Math.round(exactTime / 60_000)}`;
            if (known.has(key)) continue;
            known.add(key);
            output.push({
              kind: 'aspect', date: local.date, exactAt: new Date(exactTime).toISOString(), body: moving.name,
              target: target.name, aspect: aspect.name, exactness: 0,
              significance: 'Exact transit to a natal placement', phase: 'exact',
            });
          }
        }
      }
    }
  }
  return output.sort((left, right) => left.exactAt.localeCompare(right.exactAt));
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().replace(/\s+/g, ' ') ?? '';
  if (query.length < 2 || query.length > 120) return NextResponse.json({ error: 'Enter at least two characters to search for a city.' }, { status: 400 });
  try {
    const places = await searchPlaces(query);
    return NextResponse.json({ places: places.slice(0, 8).map(place => ({ label: place.display_name ?? '', lat: Number(place.lat), lon: Number(place.lon) })) }, { headers: { 'Cache-Control': 'private, max-age=3600' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Location search is temporarily unavailable.';
    return NextResponse.json({ error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: Request) {
  let body: { date?: string; time?: string; place?: { label?: string; lat?: number; lon?: number } };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Enter your birth details to continue.' }, { status: 400 }); }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(body.date ?? '');
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(body.time ?? '');
  const place = body.place;
  const city = place?.label?.trim() ?? '';
  const latitude = Number(place?.lat), longitude = Number(place?.lon);
  if (!dateMatch || !timeMatch || !city || city.length > 300 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: 'Enter a valid birth date and local time, search for and select your birth city, and try again.' }, { status: 400 });
  }

  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText), hour = Number(hourText), minute = Number(minuteText);
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  if (birthDate.getUTCFullYear() !== year || birthDate.getUTCMonth() !== month - 1 || birthDate.getUTCDate() !== day || hour > 23 || minute > 59 || year < 1900 || birthDate > new Date()) {
    return NextResponse.json({ error: 'Check the date and time. Birth dates must be between 1900 and today.' }, { status: 400 });
  }

  let timezone: string;
  try { timezone = tzLookup(latitude, longitude); }
  catch { return NextResponse.json({ error: 'We could not resolve the timezone for that birthplace. Try a nearby city.' }, { status: 400 }); }

  try {
    const response = await fetch(`${GEO_API}/natal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'SeraphTheAlchemist/1.0 (birth-chart feature)' },
      body: JSON.stringify({ year, month, day, hour, minute, lat: latitude, lon: longitude }),
      signal: AbortSignal.timeout(30000), cache: 'no-store',
    });
    const value: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error('The natal chart calculator could not complete this reading. Check the birth details and try again.');
    const chart = value as NatalChart;
    if (!chart || !Array.isArray(chart.cusps) || !chart.planets?.Sun || !Array.isArray(chart.aspects) || !Number.isFinite(chart.ascendant) || !Number.isFinite(chart.midheaven)) {
      throw new Error('The natal chart calculator returned incomplete placements. Please try again later.');
    }

    if (chart.partOfFortune) {
      chart.planets = { ...chart.planets, PartOfFortune: { ...chart.partOfFortune, lat: 0, dist: 0, speed_lon: 0, retrograde: false, house: chart.partOfFortune.house, dignity: 'neutral' } };
    }
    const from = new Date();
    const to = addMonths(from, 12);
    const transits = calculateTransits(chart, from, to, timezone);
    const houseCusps = chart.cusps.map((cusp, index) => ({ house: index + 1, position: zodiac(cusp) }));

    return NextResponse.json({
      chart, transits, place: city, from: isoDate(from), to: isoDate(to), timezone, houseCusps,
      transitSource: 'Astronomy Engine', natalSource: 'CosmyDay', geocodeSource: 'CosmyDay',
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The chart service is temporarily unavailable.';
    return NextResponse.json({ error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
