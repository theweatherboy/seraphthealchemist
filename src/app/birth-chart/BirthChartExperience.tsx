'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './birth-chart.module.css';
import SavedBirthDetails from './SavedBirthDetails';
import type { BirthDetails } from '@/lib/birth-profile';

type Planet = { lon: number; sign: string; degInSign: number; house: number | null; retrograde: boolean; dignity: string; speed_lon: number };
type ChartData = {
  houseSystem: string;
  ascendant: number;
  midheaven: number;
  cusps: number[];
  planets: Record<string, Planet>;
  aspects: { a: string; b: string; type: string; angle: number; delta: number; applying: boolean }[];
};
type Transit = { kind: string; date: string; exactAt: string; body: string; target: string; aspect: string; exactness?: number; significance?: string; phase?: string };
type PlaceChoice = { label: string; lat: number; lon: number };
type Reading = { chart: ChartData; transits: Transit[]; place: string; from: string; to: string; timezone: string | null; houseCusps: { house: number; position: string }[] };

const symbols: Record<string, string> = { Sun: '\u2609', Moon: '\u263e', Mercury: '\u263f', Venus: '\u2640', Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645', Neptune: '\u2646', Pluto: '\u2647', Chiron: '\u26b7', NorthNode: '\u260a', SouthNode: '\u260b' };
const meanings: Record<string, string> = { Sun: 'identity and vitality', Moon: 'emotional needs', Mercury: 'thought and expression', Venus: 'love and values', Mars: 'drive and courage', Jupiter: 'growth and faith', Saturn: 'structure and responsibility', Uranus: 'freedom and change', Neptune: 'imagination and ideals', Pluto: 'power and renewal', Chiron: 'healing and integration', NorthNode: 'growth direction', SouthNode: 'familiar strengths', Ascendant: 'identity and first impressions', Asc: 'identity and first impressions', Midheaven: 'calling and public life', MC: 'calling and public life', Descendant: 'partnership and reciprocity', IC: 'home and inner foundations' };
const transitThemes: Record<string, string> = { Sun: 'visibility and renewed focus', Moon: 'emotional awareness and care', Mercury: 'new ways to think, speak, and learn', Venus: 'values, connection, and receiving', Mars: 'courage, action, and healthy assertion', Jupiter: 'expansion, confidence, and new horizons', Saturn: 'commitment, boundaries, and lasting structure', Uranus: 'authentic change and greater freedom', Neptune: 'imagination, compassion, and discernment', Pluto: 'deep renewal and a more honest use of power', Chiron: 'tender places becoming sources of wisdom', NorthNode: 'movement toward unfamiliar growth', TrueNode: 'movement toward unfamiliar growth', SouthNode: 'releasing patterns that have run their course' };
const aspectThemes: Record<string, string> = { Conjunction: 'a concentrated beginning or turning point', Conj: 'a concentrated beginning or turning point', Sextile: 'an opening that grows through deliberate action', Square: 'friction that can reveal where change is needed', Trine: 'an available strength that can be developed', Opposition: 'a tension asking for balance and a wider perspective', Quincunx: 'an adjustment between needs that do not naturally align' };
const prompts: Record<string, string> = { Jupiter: 'Where could you make room for growth without overcommitting?', Saturn: 'What steady practice or boundary would help you meet this chapter?', Uranus: 'Where are you ready to choose a more authentic way?', Neptune: 'Which ideals nourish you, and where would clearer boundaries help?', Pluto: 'What are you ready to release so that deeper strength can emerge?', Chiron: 'How might care for a tender place become useful wisdom?', Mars: 'What deserves your energy, and how can you act with intention?', Venus: 'Which relationships and values feel mutual and life-giving?', Mercury: 'What conversation or new perspective could change the pattern?', Sun: 'Where are you being invited to show up more fully?', Moon: 'What feeling is asking to be acknowledged rather than rushed past?' };

function zodiac(longitude: number) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const position = ((longitude % 360) + 360) % 360;
  const degree = position % 30;
  const wholeDegrees = Math.floor(degree);
  const minutes = Math.floor((degree - wholeDegrees) * 60);
  return `${signs[Math.floor(position / 30)]} ${String(wholeDegrees).padStart(2, '0')}°${String(minutes).padStart(2, '0')}′`;
}
function label(value: string) { return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase()); }
function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
function formatTime(value: string, timezone: string | null) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: timezone ?? 'UTC' });
}
function natalMeaning(name: string) { return meanings[name] ?? meanings[name.replaceAll(' ', '')] ?? `your ${name.toLowerCase()} themes`; }
function growthFor(transit: Transit, chart: ChartData) {
  const movingTheme = transitThemes[transit.body] ?? `change through ${transit.body.toLowerCase()} themes`;
  const aspectTheme = aspectThemes[transit.aspect] ?? 'a meaningful point of integration';
  const natal = chart.planets[transit.target];
  const natalContext = natal ? `your natal ${transit.target} in ${natal.sign}${natal.house ? ` in house ${natal.house}` : ''}, connected with ${natalMeaning(transit.target)}` : `your natal ${transit.target}, connected with ${natalMeaning(transit.target)}`;
  const prompt = prompts[transit.body] ?? 'What old response could you meet with more awareness this time?';
  return `This can bring ${movingTheme} into focus through ${aspectTheme}, touching ${natalContext}. ${prompt}`;
}

export default function BirthChartExperience() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [places, setPlaces] = useState<PlaceChoice[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceChoice | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [includeLunarTransits, setIncludeLunarTransits] = useState(false);
  const [visibleTransitCount, setVisibleTransitCount] = useState(60);
  const resultsRef = useRef<HTMLElement>(null);
  const chartRequest = useRef<AbortController | null>(null);
  const cityRequest = useRef<AbortController | null>(null);
  useEffect(() => () => { chartRequest.current?.abort(); cityRequest.current?.abort(); }, []);
  const clearDetails = useCallback(() => {
    chartRequest.current?.abort(); chartRequest.current = null; cityRequest.current?.abort(); cityRequest.current = null;
    setLoading(false); setSearching(false);
    setBirthDate(''); setBirthTime(''); setCityQuery(''); setSelectedPlace(null); setPlaces([]); setReading(null); setError(''); setLocationError('');
  }, []);
  function loadDetails(details: BirthDetails) {
    chartRequest.current?.abort(); chartRequest.current = null; cityRequest.current?.abort(); cityRequest.current = null;
    setLoading(false); setSearching(false);
    setBirthDate(details.date); setBirthTime(details.time); setSelectedPlace(details.place); setCityQuery(details.place.label); setPlaces([]); setReading(null); setError(''); setLocationError('');
  }

  useEffect(() => {
    if (reading) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [reading]);

  async function searchCity() {
    const query = cityQuery.trim();
    if (query.length < 2) { setLocationError('Enter at least two characters to search.'); return; }
    cityRequest.current?.abort();
    const controller = new AbortController(); cityRequest.current = controller;
    setSearching(true); setLocationError(''); setPlaces([]); setSelectedPlace(null);
    try {
      const response = await fetch(`/api/birth-chart?q=${encodeURIComponent(query)}`, { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) });
      const payload = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(payload.error ?? 'City search is temporarily unavailable.');
      const choices = Array.isArray(payload.places) ? payload.places as PlaceChoice[] : [];
      setPlaces(choices);
      if (choices.length === 0) setLocationError('No matching city was found. Try adding a state, region, or country.');
    } catch (caught) { if (!controller.signal.aborted) setLocationError(caught instanceof Error ? caught.message : 'City search is temporarily unavailable.'); }
    finally { if (cityRequest.current === controller) { cityRequest.current = null; setSearching(false); } }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlace) { setError('Search for your birth city and select a matching place first.'); return; }
    chartRequest.current?.abort();
    const controller = new AbortController(); chartRequest.current = controller;
    setLoading(true); setError(''); setReading(null);
    setIncludeLunarTransits(false); setVisibleTransitCount(60);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/birth-chart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: form.get('date'), time: form.get('time'), place: selectedPlace }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(90000)]) });
      const payload = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(payload.error ?? 'We could not create your chart.');
      setReading(payload as Reading);
    } catch (caught) { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : 'We could not create your chart. Please try again.'); }
    finally { if (chartRequest.current === controller) { chartRequest.current = null; setLoading(false); } }
  }

  const planets = Object.entries(reading?.chart.planets ?? {}).filter((item): item is [string, Planet] => typeof item[1]?.sign === 'string').sort((a, b) => a[1].lon - b[1].lon);
  const sun = reading?.chart.planets.Sun;
  const lunarTransitCount = reading?.transits.filter(transit => transit.body === 'Moon').length ?? 0;
  const displayedTransits = reading ? reading.transits.filter(transit => includeLunarTransits || transit.body !== 'Moon').slice(0, visibleTransitCount) : [];
  const matchingTransitCount = reading ? reading.transits.length - (includeLunarTransits ? 0 : lunarTransitCount) : 0;
  const growthGroups = reading ? (() => {
    const groups = new Map<string, { count: number; targets: Set<string> }>();
    for (const transit of reading.transits) {
      if (!['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'TrueNode'].includes(transit.body)) continue;
      const current = groups.get(transit.body) ?? { count: 0, targets: new Set<string>() };
      current.count += 1; current.targets.add(transit.target); groups.set(transit.body, current);
    }
    return [...groups.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 4);
  })() : [];

  return <div className={styles.page}>
    <section className={styles.hero}>
      <header className="folio-opening">
      <p className={`${styles.eyebrow} eyebrow`}>A map of your becoming</p>
      <h1>Your Birth Chart</h1>
      <p className={styles.intro}>Explore the sky at your first breath, then trace its exact conversations with the planets over the coming year.</p>
      </header>
      <p className={styles.forecastNote}>Your date, local birth time, and selected birthplace are used to calculate your natal chart and year-ahead personal transits. Birth details are sent securely to CosmyDay for the natal chart. Saving them to your account is a separate, optional choice below.</p>
      <form className={styles.form} onSubmit={submit}>
        <label>Birth date<input required name="date" type="date" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} value={birthDate} onChange={event => setBirthDate(event.target.value)} /></label>
        <label>Local birth time<input required name="time" type="time" value={birthTime} onChange={event => setBirthTime(event.target.value)} /></label>
        <div className={styles.citySearch}>
          <label htmlFor="birth-city">Birth city</label>
          <div className={styles.cityControls}><input id="birth-city" type="search" minLength={2} maxLength={120} placeholder="Search a city, region, or country" autoComplete="off" value={cityQuery} onChange={event => { setCityQuery(event.target.value); setSelectedPlace(null); setPlaces([]); setLocationError(''); setError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void searchCity(); } }} /><button type="button" className={styles.searchCity} disabled={searching || cityQuery.trim().length < 2} onClick={() => void searchCity()}>{searching ? 'Searching…' : 'Find city'}</button></div>
          {locationError && <p className={styles.locationMessage} role="status">{locationError}</p>}
          {places.length > 0 && <div className={styles.placeOptions} role="listbox" aria-label="Matching birth cities">{places.map((place, index) => <button type="button" role="option" aria-selected={selectedPlace?.lat === place.lat && selectedPlace?.lon === place.lon} key={`${place.lat}-${place.lon}-${index}`} onClick={() => { setSelectedPlace(place); setCityQuery(place.label); setPlaces([]); setLocationError(''); setError(''); }}>{place.label}</button>)}</div>}
          {selectedPlace && <p className={styles.selectedPlace} role="status">Selected: {selectedPlace.label}</p>}
          <input type="hidden" name="city" value={selectedPlace?.label ?? ''} />
        </div>
        <div className={styles.yearNotice}><span>12 months</span><span>Your personal transit calendar</span></div>
        <button className={styles.submit} type="submit" disabled={loading}>{loading ? 'Calculating your year…' : 'Reveal my chart'} <span aria-hidden="true">→</span></button>
      </form>
      <p className={styles.privacy}>Your birth details are stored by this site only if you explicitly choose to save them to your account.</p>
      <SavedBirthDetails details={birthDate && birthTime && selectedPlace ? { date: birthDate, time: birthTime, place: selectedPlace } : null} onLoad={loadDetails} onClear={clearDetails} />
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>

    {reading && <section ref={resultsRef} className={styles.results} aria-live="polite" tabIndex={-1}>
      <div className={styles.resultHeading}><p className={styles.eyebrow}>Your celestial blueprint</p><h2>Your year ahead</h2><p>{formatDate(reading.from)} – {formatDate(reading.to)} · {reading.place}{reading.timezone ? ` · ${reading.timezone}` : ''}</p></div>
      <div className={styles.angles}>
        <article><span>Your Sun sign</span><strong>{sun?.sign ?? 'Unavailable'}</strong><p>{sun ? `${Math.floor(sun.degInSign)}°${String(Math.floor((sun.degInSign % 1) * 60)).padStart(2, '0')}′ · ${sun.house ? `House ${sun.house}` : 'natal placement'}` : 'Natal Sun placement'}</p></article>
        <article><span>Rising sign</span><strong>{zodiac(reading.chart.ascendant)}</strong><p>The horizon at your birth</p></article>
        <article><span>Midheaven</span><strong>{zodiac(reading.chart.midheaven)}</strong><p>Your public path and calling</p></article>
      </div>
      <div className={styles.sectionTitle}><p className={styles.eyebrow}>The wandering lights</p><h2>Your planetary placements</h2></div>
      <div className={styles.planetGrid}>{planets.map(([name, planet]) => <article className={styles.planet} key={name}>
        <span className={styles.glyph} aria-hidden="true">{symbols[name] ?? '✧'}</span><div><h3>{name} in {planet.sign}</h3><p>{planet.sign} shapes your {meanings[name] ?? name.toLowerCase()}{planet.house ? ` through the themes of house ${planet.house}` : ''}.</p><small>{Math.floor(planet.degInSign)}° {String(Math.floor((planet.degInSign % 1) * 60)).padStart(2, '0')}′{planet.house ? ` · House ${planet.house}` : ''}{planet.retrograde ? ' · Retrograde' : ''}</small></div>
      </article>)}</div>
      <div className={styles.lowerGrid}>
        <section className={styles.infoCard}><p className={styles.eyebrow}>The twelve rooms</p><h2>House cusps</h2><div className={styles.houseGrid}>{reading.houseCusps.map(item => <div key={item.house}><span>{String(item.house).padStart(2, '0')}</span><strong>{item.position}</strong></div>)}</div><p className={styles.note}>Calculated with the {reading.chart.houseSystem} house system.</p></section>
        <section className={styles.infoCard}><p className={styles.eyebrow}>Celestial conversations</p><h2>Your natal aspects</h2><div className={styles.aspectList}>{reading.chart.aspects.slice(0, 18).map((aspect, index) => <div key={`${aspect.a}-${aspect.b}-${index}`}><strong>{label(aspect.a)} {label(aspect.type)} {label(aspect.b)}</strong><span>{Math.abs(aspect.delta).toFixed(1)}° orb · {aspect.applying ? 'applying' : 'separating'}</span></div>)}{!reading.chart.aspects.length && <p>No major aspects were returned for this chart.</p>}</div></section>
      </div>

      <section className={styles.forecastSection}>
        <div className={styles.sectionTitle}><p className={styles.eyebrow}>Personal transits · exact aspect dates</p><h2>The year’s growth themes</h2><p>{reading.transits.length} exact transit-to-natal aspect{reading.transits.length === 1 ? '' : 's'} in the year ahead. Dates are calculated against your natal placements.</p></div>
        {growthGroups.length > 0 && <div className={styles.growthGrid}>{growthGroups.map(([body, group]) => <article className={styles.growthCard} key={body}><span>{body}</span><h3>{transitThemes[body] ?? 'Growth and integration'}</h3><p>{group.count} exact contact{group.count === 1 ? '' : 's'} with your natal {Array.from(group.targets).slice(0, 3).join(', ')}{group.targets.size > 3 ? ' and other placements' : ''}. These dates can offer useful moments to notice how this area of life is changing.</p></article>)}</div>}
        {reading.transits.length > 0 ? <>
          <div className={styles.transitControls}>
            <p>Showing {Math.min(displayedTransits.length, matchingTransitCount)} of {matchingTransitCount.toLocaleString()} {includeLunarTransits ? 'planetary and lunar' : 'planetary'} contacts.</p>
            {lunarTransitCount > 0 && <button type="button" onClick={() => { setIncludeLunarTransits(value => !value); setVisibleTransitCount(60); }}>{includeLunarTransits ? 'Hide frequent Moon contacts' : `Include Moon contacts (${lunarTransitCount.toLocaleString()})`}</button>}
          </div>
          <div className={styles.events}>{displayedTransits.map((transit, index) => <article key={`${transit.exactAt}-${transit.body}-${transit.target}-${transit.aspect}-${index}`}><time><span>{formatDate(transit.date)}</span><small>{formatTime(transit.exactAt, reading.timezone)} {reading.timezone}</small></time><div><h3>{transit.body} {transit.aspect.toLowerCase()} natal {transit.target}</h3><p>{growthFor(transit, reading.chart)}</p><small>{transit.significance ? `Significance: ${transit.significance}` : 'Exact transit-to-natal aspect'}</small></div><span className={styles.transitMark}>✧</span></article>)}</div>
          {displayedTransits.length < matchingTransitCount && <button className={styles.moreTransits} type="button" onClick={() => setVisibleTransitCount(count => count + 60)}>Show more transit dates</button>}
        </> : <p className={styles.empty}>No exact transit-to-natal aspect dates were returned in this year window.</p>}
        <p className={styles.disclaimer}>Astrological growth themes are symbolic prompts for reflection, not guaranteed outcomes or professional medical, mental-health, financial, or legal advice. CosmyDay calculates your natal chart. Year-ahead planetary positions are calculated on this site with Astronomy Engine, whose published accuracy is approximately one arcminute; exact-contact times are model estimates, shown in the birthplace timezone. The interpretations here are editorial guidance.</p>
      </section>
      <p className={styles.credit}>Natal chart and birthplace search by <a href="https://cosmyday.com/api-docs" target="_blank" rel="noreferrer">CosmyDay</a>. Transit positions by <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Astronomy Engine</a>.</p>
    </section>}
    <footer className={styles.footer}><span>✧</span><p>The heavens above, the wisdom within.</p></footer>
  </div>;
}
