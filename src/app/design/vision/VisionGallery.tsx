'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkle } from 'lucide-react';
import styles from './vision.module.css';

const options = [
  { id: 'terrace', name: 'Waterfall terrace', mood: 'Lush · open · golden', image: '/images/sanctuary-vision-v3.webp', description: 'An open sanctuary with cascading water, weathered columns, and soft sunset light. The closest continuation of the offering portals.' },
  { id: 'homecoming', name: 'Sunset homecoming', mood: 'Grounded · warm · expansive', image: '/images/earthly-homecoming-v1.webp', description: 'An ancient arch overlooking still water. Books, olive branches, and crystals bring the spiritual world into everyday life.' },
  { id: 'moonlit', name: 'Moonlit sanctuary', mood: 'Quiet · celestial · reflective', image: '/images/sanctuary-vision-moonlit-v4.webp', description: 'A quieter evening atmosphere that echoes the moonlit opening of the homepage.' },
  { id: 'stone', name: 'Stone & sanctuary', mood: 'Light · tactile · spacious', image: '/images/sanctuary-vision-v3.webp', description: 'A worn limestone reading panel paired with an arched view into the sanctuary. More breathing room, with the message clearly separated from the scenery.' },
  { id: 'current', name: 'Current alchemy', mood: 'Current homepage · comparison', image: '/images/sanctuary-alchemy-v5.webp', description: 'The existing alchemist’s workbench, included so you can compare the atmosphere and composition.' },
];

export default function VisionGallery() {
  const [selected, setSelected] = useState('terrace');
  const [mobile, setMobile] = useState(false);
  const option = options.find(item => item.id === selected)!;
  return <div className={styles.studio}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>Homepage design samples</p>
      <h1>A different kind of harmony.</h1>
      <p>Explore four directions for the vision section. Each uses the same homepage message so you can compare the setting and layout.</p>
      <div className={styles.links}><Link href="/#offerings">View the lighter stone offerings <ArrowRight size={15} /></Link><Link href="/design/strands">Thread studio <ArrowRight size={15} /></Link></div>
    </header>
    <div className={styles.choices} aria-label="Vision design options">
      {options.map((item, index) => <button type="button" key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>
        <span className={styles.thumbnail}><Image src={item.image} alt="" fill sizes="(max-width: 650px) 45vw, 20vw" /></span>
        <span className={styles.choiceName}>{index === 4 ? 'Original' : `0${index + 1}`} <span>{item.name}</span></span>
        <span className={styles.mood}>{item.mood}</span>
      </button>)}
    </div>
    <div className={styles.previewHeading}>
      <div aria-live="polite"><h2>{option.name}</h2><p>{option.description}</p></div>
      <div className={styles.sizes} aria-label="Preview width"><button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}>Full width</button><button type="button" aria-pressed={mobile} onClick={() => setMobile(true)}>Phone</button></div>
    </div>
    <div className={`${styles.frame} ${mobile ? styles.phone : ''}`}>
      <div className={styles.stoneEdge}><Sparkle size={18} strokeWidth={1} /><span>The journey continues</span><Sparkle size={18} strokeWidth={1} /></div>
      <section className={`${styles.scene} ${selected === 'stone' ? styles.split : ''}`} aria-labelledby="sample-vision-title">
        <div className={styles.art}><Image key={option.image} src={option.image} alt="" fill sizes={mobile ? '390px' : '100vw'} priority /></div>
        <div className={styles.shade} />
        <div className={styles.copy}>
          <p className={styles.eyebrow}>The vision</p>
          <h2 id="sample-vision-title">A world in harmony</h2>
          <p className={styles.script}>Within and Without</p>
          <p className={styles.body}>I believe in a world where spiritual wisdom and everyday life exist in harmony — not as an escape, but as a return. And where your soul’s gifts are meant to be lived, not just explored.</p>
          <Link href="/about" className={styles.action}>Learn more <ArrowRight size={18} strokeWidth={1} /></Link>
        </div>
        <p className={styles.note}>People<br />Places<br />Practices<br />Possibilities</p>
      </section>
    </div>
    <p className={styles.endnote}>Preview only — choosing an option here does not replace the homepage vision section.</p>
  </div>;
}
