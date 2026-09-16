import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './legal.module.css';

export type LegalSection = { id: string; title: string; content: ReactNode };

export default function LegalDocument({ title, introduction, sections }: { title: string; introduction: string; sections: LegalSection[] }) {
  return <article className={styles.document}>
    <header id="top" className={styles.header}>
      <p className="eyebrow">Seraph, The Alchemist</p>
      <h1>{title}</h1>
      <p>{introduction}</p>
      <p className={styles.date}>Last updated: September 16, 2026</p>
      <nav className={styles.links} aria-label="Legal pages">
        <Link href="/terms-of-service">Terms of Service</Link>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
    <nav className={styles.contents} aria-label="On this page">
      <p>On this page</p>
      <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
    </nav>
    <div className={styles.body}>{sections.map((section, index) => <section id={section.id} key={section.id}>
      <h2>{index + 1}. {section.title}</h2>
      {section.content}
    </section>)}</div>
    <footer className={styles.footer}><Link href="/">Return to the sanctuary</Link><a href="#top">Back to top</a></footer>
  </article>;
}
