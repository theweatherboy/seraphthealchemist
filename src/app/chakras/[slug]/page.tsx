import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ChakraAtmosphere from '@/components/chakras/ChakraAtmosphere';
import { chakras, chakraContext, findChakra } from '@/data/chakras';
import styles from './chakra.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return chakras.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chakra = findChakra((await params).slug);
  if (!chakra) notFound();
  return {
    title: `${chakra.name} Chakra | Seraph, The Alchemist`,
    description: `Explore the ${chakra.name} chakra through symbolic states, balancing practices, crystals, food options, and sound correspondences.`,
  };
}

export default async function ChakraPage({ params }: Props) {
  const chakra = findChakra((await params).slug);
  if (!chakra) notFound();
  const next = chakras[chakra.number % chakras.length];

  return (
    <article className={styles.page} style={{ '--chakra-color': chakra.color } as CSSProperties}>
      <ChakraAtmosphere realmId={chakra.realmId} />
      <Link href="/#journey" className={styles.back}><ArrowLeft size={15} aria-hidden="true" /> All seven paths</Link>
      <header className={styles.header}>
        <div className={styles.sigil} aria-hidden="true"><Sparkles size={38} strokeWidth={1} /></div>
        <p className="eyebrow">0{chakra.number} / {chakra.realmName} realm</p>
        <h1>{chakra.name} <span>chakra</span></h1>
        <p className={styles.intro}>A spiritual and symbolic guide for reflection.</p>
        <a href="#important-context" className={styles.contextLink}>About these correspondences</a>
      </header>

      <nav className={styles.chakraNav} aria-label="Explore the seven chakras">
        {chakras.map(item => <Link key={item.slug} href={`/chakras/${item.slug}`} aria-current={item.slug === chakra.slug ? 'page' : undefined} style={{ '--link-color': item.color } as CSSProperties}><span aria-hidden="true" />{item.name}</Link>)}
      </nav>

      <section className={styles.section} aria-labelledby="chakra-states">
        <div className={styles.sectionHeading}><p className="eyebrow">Notice the patterns</p><h2 id="chakra-states">Chakra states</h2></div>
        <div className={styles.states}>
          <div className={styles.card}><h3>Underactive</h3><p>{chakra.states.underactive}</p></div>
          <div className={`${styles.card} ${styles.balanced}`}><h3>Balanced</h3><p>{chakra.states.balanced}</p></div>
          <div className={styles.card}><h3>Overactive</h3><p>{chakra.states.overactive}</p></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="balancing-correspondences">
        <div className={styles.sectionHeading}><p className="eyebrow">Bring intention to practice</p><h2 id="balancing-correspondences">Balancing correspondences</h2></div>
        <dl className={styles.correspondences}>
          <div className={styles.card}><dt>Crystals</dt><dd>{chakra.crystals}</dd></div>
          <div className={styles.card}><dt>Food options</dt><dd>{chakra.foods}</dd></div>
          <div className={styles.card}><dt>Frequency options</dt><dd><span className={styles.frequency}>{chakra.frequency} Hz <span aria-hidden="true">·</span> {chakra.note} note</span><a href="#important-context" className={styles.contextLink}>Symbolic sound associations</a></dd></div>
          <div className={styles.card}><dt>Balancing practices</dt><dd>{chakra.practices}</dd></div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="balancing-states">
        <div className={styles.sectionHeading}><p className="eyebrow">Return to balance</p><h2 id="balancing-states">How to balance each state</h2></div>
        <div className={styles.practices}>
          <div className={styles.card}><h3>If underactive</h3><p>{chakra.underactivePractice}</p></div>
          <div className={styles.card}><h3>If overactive</h3><p>{chakra.overactivePractice}</p></div>
        </div>
      </section>

      <aside id="important-context" className={styles.context} aria-labelledby="context-title"><h2 id="context-title">Important context</h2><p>{chakraContext}</p></aside>
      <footer className={styles.footer}>
        <Link href="/#journey"><ArrowLeft size={15} aria-hidden="true" /> Return to the seven paths</Link>
        <Link href={`/chakras/${next.slug}`}>Explore {next.name} <ArrowRight size={15} aria-hidden="true" /></Link>
      </footer>
    </article>
  );
}
