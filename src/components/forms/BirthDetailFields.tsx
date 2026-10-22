'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './birth-detail-fields.module.css';

export type BirthPlace = { label: string; lat: number; lon: number };
type Props = {
  date: string; time: string; place: BirthPlace | null;
  onDate: (value: string) => void; onTime: (value: string) => void; onPlace: (value: BirthPlace | null) => void;
  optional?: boolean; dark?: boolean;
};

export default function BirthDetailFields({ date, time, place, onDate, onTime, onPlace, optional = false, dark = false }: Props) {
  const id = useId();
  const [query, setQuery] = useState(place?.label ?? '');
  const [places, setPlaces] = useState<BirthPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  function changeQuery(value: string) {
    request.current?.abort(); request.current = null;
    setSearching(false); setQuery(value); setPlaces([]); setError(''); onPlace(null);
  }
  async function searchCity() {
    if (query.trim().length < 2) { setError('Enter at least two characters to search.'); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setSearching(true); setError(''); setPlaces([]); onPlace(null);
    try {
      const response = await fetch(`/api/birth-chart?q=${encodeURIComponent(query.trim())}`, { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) });
      const payload = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(payload.error ?? 'City search is temporarily unavailable.');
      const matches = Array.isArray(payload.places) ? payload.places as BirthPlace[] : [];
      setPlaces(matches);
      if (!matches.length) setError('No matching city was found. Try adding a state, region, or country.');
    } catch (caught) {
      if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : 'City search is temporarily unavailable.');
    } finally { if (request.current === controller) { request.current = null; setSearching(false); } }
  }

  return <div className={`${styles.fields} ${dark ? styles.dark : ''}`}>
    <label className={styles.label}>Birth date {optional && <small>Optional</small>}
      <input name="date" type="date" required={!optional} min="1900-01-01" max={new Date().toISOString().slice(0, 10)} value={date} onChange={event => onDate(event.target.value)} />
    </label>
    <label className={styles.label}>Local birth time {optional && <small>Optional</small>}
      <input name="time" type="time" required={!optional} value={time} onChange={event => onTime(event.target.value)} />
      {optional && <span className={styles.hint}>Not sure of the time? Leave it blank.</span>}
    </label>
    <div className={styles.city}>
      <label className={styles.label} htmlFor={`${id}-city`}>Birth city {optional && <small>Optional</small>}</label>
      <div className={styles.search}>
        <input id={`${id}-city`} type="search" maxLength={120} placeholder="Search a city, region, or country" autoComplete="off" value={query} aria-describedby={`${id}-help`} onChange={event => changeQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void searchCity(); } }} />
        <button type="button" disabled={searching || query.trim().length < 2} onClick={() => void searchCity()}>{searching ? 'Searching…' : 'Find city'}</button>
      </div>
      <p id={`${id}-help`} className={styles.hint}>Search, then choose your birthplace from the matching cities.</p>
      {error && <p className={styles.message} role="status">{error}{optional && ' You can leave the birthplace blank and continue.'}</p>}
      {places.length > 0 && <ul className={styles.results} aria-label="Matching birth cities">{places.map((choice, index) => <li key={`${choice.lat}-${choice.lon}-${index}`}><button type="button" onClick={() => { onPlace(choice); setQuery(choice.label); setPlaces([]); setError(''); }}>{choice.label}</button></li>)}</ul>}
      {place && <p className={styles.selected} role="status">✓ {place.label}<button type="button" onClick={() => changeQuery('')}>Clear</button></p>}
      {optional && query && !place && !searching && !error && <p className={styles.hint}>No birthplace selected yet. Only a selected city will be saved.</p>}
      <input type="hidden" name="city" value={place?.label ?? ''} />
      <input type="hidden" name="birth_latitude" value={place?.lat ?? ''} />
      <input type="hidden" name="birth_longitude" value={place?.lon ?? ''} />
    </div>
  </div>;
}
