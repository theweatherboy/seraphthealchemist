import Link from 'next/link';
import Image from 'next/image';
import { Italianno } from 'next/font/google';
import { ArrowRight, Moon, Sun, Compass, Triangle, Infinity as InfinityIcon, Sparkle } from 'lucide-react';
import SceneBackdrop from '@/components/visual/SceneBackdrop';
import PortalLink from '@/components/ui/PortalLink';
import styles from './earthly-home.module.css';

const script = Italianno({ weight: '400', subsets: ['latin'], variable: '--font-sanctuary-script' });
const portalArtwork = ['divination', 'healing', 'journeys', 'teachings', 'loom'];
const offerings = [
  { name: 'Divination', copy: 'Clarity through tarot, oracle, and astrology.', href: '/services#seer', icon: Moon },
  { name: 'Healing', copy: 'Energetic clearing, Reiki, and quantum alignment.', href: '/services#healer', icon: Sun },
  { name: 'Journeys', copy: 'Guided experiences, deeper connection, and soul remembrance.', href: '/services#journey', icon: Compass },
  { name: 'Teachings', copy: 'Tools, practices, and wisdom for everyday alchemy.', href: '/grimoire', icon: Triangle },
  { name: 'The Alchemist’s Loom', copy: 'Custom experiences to weave it all together.', href: '/contact', icon: InfinityIcon },
];

export default function Home() {
  return <div className={styles.home + ' ' + script.variable}>
    <section className={styles.hero} aria-labelledby="sanctuary-title">
      <SceneBackdrop poster="/images/sanctuary-hero-v3.webp" scene="sanctuary" className={styles.heroArt} label="sanctuary" priority speed={.23} controlClassName={styles.motionControl} />
      <div className={styles.heroShade} />
      <aside className={styles.marginNote} aria-hidden="true">Same<br />soul<br />more<br />magic<span>✦</span></aside>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>A bridge between worlds</p>
        <h1 id="sanctuary-title">Sacred<br />knowledge</h1>
        <p className={styles.script}>for a More Aligned You</p>
        <p className={styles.description}>Ancient wisdom. Modern tools.<br />A sanctuary for multi-dimensional souls where the mystical meets the practical, and your soul’s wisdom finds a home in the here and now.</p>
        <a className={styles.button} href="#offerings">Explore the path <ArrowRight size={19} strokeWidth={1} /></a>
        <p className={styles.values}>Heal <Sparkle /> Align <Sparkle /> Evolve <Sparkle /> Belong</p>
      </div>
    </section>
    <section id="offerings" className={styles.offerings} aria-labelledby="offerings-title">
      <SceneBackdrop scene="offerings" className={styles.portalThreads} label="portals" speed={.23} controlClassName={styles.portalControl} />
      <header className={styles.sectionHeading}>
        <p className={styles.eyebrow}>The offerings</p>
        <h2 id="offerings-title">One soul with infinite journeys.</h2>
        <p>Explore the paths, tools, and teachings that support you — wherever you are on your journey.</p>
      </header>
      <div className={styles.portals}>
        {offerings.map(({ name, copy, href, icon: Icon }, index) => <PortalLink className={styles.portal} href={href} key={name}>
          <div className={styles.portalArt} aria-hidden="true"><Image src={'/images/portal-' + portalArtwork[index] + '-v4.webp'} alt="" width={680} height={1020} sizes="(max-width: 650px) 48vw, (max-width: 1600px) 19vw, 292px" /></div>
          <div className={styles.portalCopy}>
            <h3>{name}</h3><p>{copy}</p><Icon className={styles.portalSymbol} size={31} strokeWidth={1} aria-hidden="true" />
            <span className={styles.portalAction}>Enter the portal <ArrowRight size={13} /></span>
          </div>
        </PortalLink>)}
      </div>
      <div className={styles.furtherPaths}><Link href="/birth-chart">Your birth chart <ArrowRight size={13} /></Link><span aria-hidden="true">✦</span><Link href="/chakras/earth-star">Explore the nine chakras <ArrowRight size={13} /></Link></div>
    </section>
    <section className={styles.vision} aria-labelledby="vision-title">
      <SceneBackdrop poster="/images/sanctuary-vision-v3.webp" scene="vision" className={styles.visionArt} label="vision" speed={.23} controlClassName={styles.visionControl} />
      <div className={styles.visionShade} />
      <div className={styles.visionCopy}>
        <p className={styles.eyebrow}>The vision</p>
        <h2 id="vision-title">A world in harmony</h2>
        <p className={styles.script}>Within and Without</p>
        <p className={styles.description}>I believe in a world where spiritual wisdom and everyday life exist in harmony — not as an escape, but as a return. And where your soul’s gifts are meant to be lived, not just explored.</p>
        <Link href="/about" className={styles.button}>Learn more <ArrowRight size={19} strokeWidth={1} /></Link>
      </div>
      <aside className={styles.visionNote} aria-hidden="true">People<br />Places<br />Practices<br />Possibilities<span>✦</span></aside>
      <footer className={styles.footer}>
        <Link href="/" className={styles.wordmark}>Seraph<small>The Alchemist</small></Link>
        <p>Not to escape, but to be more present.</p>
        <nav aria-label="Footer"><Link href="/reviews">Testimonies</Link><Link href="/contact">Connect</Link><Link href="/account" prefetch={false}>Account</Link></nav>
        <div className={styles.legal}><span>© {new Date().getFullYear()} Seraph the Alchemist</span><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link></div>
      </footer>
    </section>
  </div>;
}
