'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import styles from '@/app/earthly-home.module.css';

export type FeaturedTestimony = { id: string; body: string };

export default function FeaturedTestimonies({ testimonies }: { testimonies: FeaturedTestimony[] }) {
  const [active, setActive] = useState(0);
  const current = testimonies[active];
  const multiple = testimonies.length > 1;
  const move = (direction: number) => setActive(index => (index + direction + testimonies.length) % testimonies.length);
  return <div className={styles.testimonies} aria-label={current ? 'Featured testimonies' : 'An invitation to return'} aria-roledescription={multiple ? 'carousel' : undefined}>
    {multiple && <button className={styles.previous} onClick={() => move(-1)} aria-label="Previous testimony"><ArrowLeft size={22} strokeWidth={1} /></button>}
    <div className={styles.testimonyContent} aria-live="polite" aria-atomic="true">
      {current ? <><blockquote><p>“{current.body}”</p><footer>— Sanctuary member</footer></blockquote><Link href="/reviews" className={styles.testimonyLink}>Read the testimonies <ArrowRight size={13} /></Link></> : <><Sparkles size={26} strokeWidth={1} aria-hidden="true" /><h2>Every journey is a homecoming.</h2><p className={styles.reflection}>A space to be seen. A moment to reconnect.<br />A thread to guide you back to yourself.</p><Link href="/reviews" className={styles.testimonyLink}>Stories from the sanctuary <ArrowRight size={13} /></Link></>}
    </div>
    {multiple && <><button className={styles.next} onClick={() => move(1)} aria-label="Next testimony"><ArrowRight size={22} strokeWidth={1} /></button><div className={styles.dots}>{testimonies.map((testimony, index) => <button key={testimony.id} aria-label={`Show testimony ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)}><span /></button>)}</div></>}
  </div>;
}
