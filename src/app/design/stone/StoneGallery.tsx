'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import styles from './stone.module.css';

const palettes = [
  { id: 'forest', name: 'Forest green', color: '#263d32', mood: 'Deep moss, aged stone, and candlelit gold.' },
  { id: 'charcoal', name: 'Charcoal', color: '#343638', mood: 'Smoky mineral grey with warm ivory and antique gold.' },
  { id: 'navy', name: 'Midnight navy', color: '#25364e', mood: 'Moonlit blue stone that carries the night sky through the page.' },
  { id: 'maroon', name: 'Maroon', color: '#502c38', mood: 'A rich wine-colored stone with a quiet, ceremonial warmth.' },
  { id: 'gold', name: 'Dark gold', color: '#665331', mood: 'Weathered bronze and old gold, with a darker earthen feel.' },
  { id: 'tan', name: 'Sandstone tan', color: '#d8c6a8', mood: 'The lighter sandstone, included for comparison.' },
];

export default function StoneGallery({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState('navy');
  const palette = palettes.find(item => item.id === selected)!;
  const light = selected === 'tan';
  const variables = {
    '--stone-color': palette.color,
    '--stone-heading': light ? '#493725' : '#ffebc7',
    '--stone-copy': light ? '#513d29' : '#edd0a1',
    '--stone-hover': light ? '#302417' : '#fff4d9',
  } as CSSProperties;

  return <div className={styles.studio} style={variables}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>Stone palette studio</p>
      <h1>A darker kind of sanctuary.</h1>
      <p>Five dark stone colors, shown on the full homepage. Scroll through the artwork and both transitions, then switch colors to compare.</p>
      <div className={styles.links}><a href="#offerings">Jump to the stone &amp; portals ↓</a><Link href="/design/vision">Vision samples ↗</Link><Link href="/">Current homepage ↗</Link></div>
    </header>
    <div className={styles.controls}>
      <div className={styles.swatches} role="group" aria-label="Stone colors">
        {palettes.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>
          <span className={styles.swatch} style={{ backgroundColor: item.color }} aria-hidden="true" />
          <span>{item.name}</span>
        </button>)}
      </div>
      <p className={styles.caption} aria-live="polite"><strong>{palette.name}</strong><span>{palette.mood}</span></p>
    </div>
    <div className={styles.preview}>{children}</div>
    <p className={styles.footnote}>Preview only. Midnight navy is now the homepage color. Try other palettes here for comparison.</p>
  </div>;
}
