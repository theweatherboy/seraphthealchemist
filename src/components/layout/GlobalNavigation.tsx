'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu } from 'lucide-react';
import { chakraNavigation } from '@/data/realms';
import styles from './navigation.module.css';

const primaryLinks = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/tiktok-live', 'TikTok LIVE'], ['/birth-chart', 'Birth Chart'], ['/reviews', 'Testimonies'], ['/grimoire', 'Grimoire'], ['/contact', 'Contact']] as const;
const extraLinks = [['/account', 'Your account'], ['/forge', 'Offerings'], ['/support', 'Support'], ['/terms-of-service', 'Terms of Service'], ['/privacy-policy', 'Privacy Policy']] as const;

export default function GlobalNavigation() {
  const [visible, setVisible] = useState<string[] | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const home = pathname === '/';
  useEffect(() => {
    let controller: AbortController | undefined;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      fetch('/api/navigation', { cache: 'no-store', signal })
        .then(response => response.ok ? response.json() : null)
        .then(payload => {
          if (!signal.aborted && payload) setVisible(payload.items.filter((item: { is_visible?: boolean }) => item.is_visible !== false).map((item: { href: string }) => item.href));
        })
        .catch(() => {});
    };
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onPointer = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, []);
  const show = (href: string) => visible === null || visible.includes(href);
  const close = () => { if (menu.current) menu.current.open = false; };
  return <header className={[styles.header, home ? styles.light : styles.dark, scrolled ? styles.scrolled : ''].join(' ')}>
    <a href="#main-content" className={styles.skip}>Skip to content</a>
    <Link href="/" className={styles.brand} aria-label="Seraph the Alchemist home" onClick={close}>
      <Image src="/seraph-golden-logo-v1.png" width={48} height={72} sizes="(max-width: 1000px) 39px, 48px" alt="" />
      <span>Seraph<small>The Alchemist</small></span>
    </Link>
    <nav className={styles.primary} aria-label="Main navigation">
      {primaryLinks.filter(([href]) => show(href)).map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
    </nav>
    <div className={styles.actions}>
      {show('/tiktok-live') && <Link className={styles.mobileLive} href="/tiktok-live" aria-current={pathname === '/tiktok-live' ? 'page' : undefined}>TikTok LIVE</Link>}
      {pathname === '/tiktok-live'
        ? <a className={styles.enter} href="#live-request">LIVE offerings <ArrowRight size={15} /></a>
        : <Link className={styles.enter} href="/services">Book a reading <ArrowRight size={15} /></Link>}
      <details ref={menu} className={styles.menu} key={pathname} onKeyDown={event => {
        if (event.key === 'Escape') {
          close();
          menu.current?.querySelector('summary')?.focus();
        }
      }}>
        <summary aria-label="Open navigation menu"><Menu size={21} strokeWidth={1.5} /></summary>
        <nav className={styles.dropdown} aria-label="Additional navigation" onClick={close}>
          {primaryLinks.filter(([href]) => show(href)).map(([href, label]) => <Link className={styles.mobileLink} href={href} key={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
          <div className={styles.chakraMenu} role="group" aria-label="Chakras">
            <p>Explore the chakras</p>
            {chakraNavigation.map(chakra => <Link href={`/chakras/${chakra.slug}`} key={chakra.slug} prefetch={false} aria-current={pathname === `/chakras/${chakra.slug}` ? 'page' : undefined}><span style={{ backgroundColor: chakra.color }} aria-hidden="true" />{chakra.name}</Link>)}
          </div>
          {extraLinks.filter(([href]) => show(href)).map(([href, label]) => <Link href={href} key={href} prefetch={href === '/account' ? false : undefined} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
        </nav>
      </details>
    </div>
  </header>;
}
