'use client';

import { useEffect, useState, useTransition, type CSSProperties } from 'react';
import { BookOpen, ChevronRight, FileText, HeartHandshake, House, LoaderCircle, LockKeyhole, Mail, MessageCircle, MoonStar, ShieldCheck, Sparkles, Sprout, UserRound } from 'lucide-react';
import { updateNavigationVisibility } from '@/app/admin/actions';
import type { NavigationItem } from '@/lib/navigation';
import styles from './navigation-visibility.module.css';

const details = [
  { icon: House, description: 'Main landing page of the site.' },
  { icon: UserRound, description: 'Your story, mission, and what Seraph is about.' },
  { icon: Sprout, description: 'Explore all offerings and sessions.' },
  { icon: BookOpen, description: 'Insights, teachings, and sacred knowledge.' },
  { icon: MessageCircle, description: 'Client experiences and kind words.' },
  { icon: Sparkles, description: 'Special offerings, creations, and extras.' },
  { icon: HeartHandshake, description: 'Support the sanctuary and its work.' },
  { icon: Mail, description: 'Get in touch or send a message.' },
  { icon: UserRound, description: 'Manage your account and preferences.' },
  { icon: FileText, description: 'Always visible.' },
  { icon: ShieldCheck, description: 'Always visible.' },
];
const isLocked = (href: string) => href === '/terms-of-service' || href === '/privacy-policy';

export default function NavigationVisibilityEditor() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/navigation', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Menu visibility could not be loaded. Please reload this page.');
      const data = await response.json();
      setItems(data.items); setLoading(false);
    }).catch(error => { if (!controller.signal.aborted) { setError(error.message); setLoading(false); } });
    return () => controller.abort();
  }, []);
  function toggle(item: NavigationItem) {
    if (pending || isLocked(item.href)) return;
    setSaving(item.href); setError(''); setMessage('');
    startTransition(async () => {
      const form = new FormData();
      form.set('href', item.href);
      form.set('is_visible', String(item.is_visible === false));
      try {
        const result = await updateNavigationVisibility(form);
        if (!result.ok) { setError(result.error); return; }
        setItems(current => current.map(row => row.href === item.href ? { ...row, is_visible: result.visible } : row));
        setMessage(`${item.label} is now ${result.visible ? 'visible' : 'hidden'}. Saved.`);
      } catch { setError('The change could not be saved. Please try again.'); }
      finally { setSaving(null); }
    });
  }
  return <section className={styles.panel} aria-labelledby="navigation-heading">
    <header className={styles.header}>
      <div><h2 id="navigation-heading">Visible Site Links</h2>
        <p>Each switch shows the current state. Clicking it saves the opposite state.<br />Hidden links disappear from the main menu, but their pages remain reachable by direct URL.</p>
        <p className={styles.legal}><ShieldCheck size={14} /> Terms of Service and Privacy Policy stay visible.</p>
      </div>
      <div className={styles.signature} aria-hidden="true"><Sparkles /><span>Same soul · Different paths</span></div>
    </header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <span className={styles.announcement} role="status">{message}</span>
    {loading ? <p role="status">Loading menu settings…</p> : <ul className={styles.list}>
      {items.map(item => {
        const locked = isLocked(item.href);
        const visible = locked || item.is_visible !== false;
        const detail = details[item.sort_order] ?? details[0];
        const Icon = detail.icon;
        return <li key={item.href} className={[styles.row, visible ? styles.visible : styles.hidden, locked ? styles.locked : ''].join(' ')} style={{ '--art-position': `${25 + item.sort_order * 7}% ${20 + item.sort_order * 8}%` } as CSSProperties}>
          <span className={styles.icon}><Icon strokeWidth={1.4} /></span>
          <div className={styles.identity}><h3>{item.label}</h3><small>{item.href}</small></div>
          <span className={styles.description}>{detail.description}</span>
          {locked ? <span className={styles.lock}><LockKeyhole size={18} />Always visible</span> :
            <button type="button" role="switch" aria-checked={visible} aria-label={`${item.label} menu visibility`} aria-busy={saving === item.href} disabled={pending} className={styles.toggle} onClick={() => toggle(item)}>
              <span className={styles.track}><span className={styles.thumb}>{saving === item.href && <LoaderCircle size={14} className={styles.spinner} />}</span></span>
              <span>{saving === item.href ? 'Saving…' : visible ? 'Visible' : 'Hidden'}</span>
            </button>}
          {!locked && <a className={styles.preview} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${item.label} (opens in a new tab)`}><ChevronRight size={21} strokeWidth={1.2} /></a>}
        </li>;
      })}
    </ul>}
    <footer className={styles.footer}><span>Seraph, The Alchemist</span><span className={styles.moon} aria-hidden="true"><MoonStar size={34} strokeWidth={1} /></span><span>Sacred knowledge · Healing · Transformation</span></footer>
  </section>;
}
