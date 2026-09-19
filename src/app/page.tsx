import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, Eye, Heart, Leaf, Moon, Orbit, Sparkles, Sun } from 'lucide-react';
import { chakraPages, realms } from '@/data/realms';
import { createClient } from '@/lib/supabase/server';
import FeaturedTestimonies, { type FeaturedTestimony } from '@/components/features/FeaturedTestimonies';
import styles from './home.module.css';

const realmIcons = [Leaf, Moon, Sun, Heart, Moon, Eye, Orbit];
const realmDescriptions = [
  ['Grounding · Protection', 'Presence · Energy Hygiene'],
  ['Emotion · Creativity', 'Energy · Movement'],
  ['Transformation · Will', 'Shadow Work · Alchemy'],
  ['Compassion · Integration', 'Reiki · Inner Union'],
  ['Mysticism · Symbolism', 'Spiritual Study'],
  ['Intuition · Dreams', 'Divination · Astral'],
  ['Angels · Seraphim', 'Higher Consciousness'],
];
const offerings = [
  { name: 'Personal readings', icon: Leaf, href: '/services' },
  { name: 'Energy healing', icon: Sun, href: '/services' },
  { name: 'Teachings & activations', icon: Sparkles, href: '/grimoire' },
  { name: 'Divine guidance', icon: Compass, href: '/services' },
  { name: 'Community', icon: Orbit, href: '/contact' },
];

async function getFeaturedTestimonies(): Promise<FeaturedTestimony[]> {
  try {
    const client = await createClient();
    if (!client) return [];
    const { data, error } = await client.from('reviews')
      .select('id,approved_revision_id')
      .eq('status', 'approved').order('updated_at', { ascending: false }).limit(5);
    if (error || !data?.length) return [];
    const revisionIds = data.flatMap(review => review.approved_revision_id ? [review.approved_revision_id] : []);
    if (!revisionIds.length) return [];
    const { data: revisions, error: revisionError } = await client.from('review_revisions')
      .select('id,body').in('id', revisionIds).eq('moderation_status', 'approved');
    if (revisionError) return [];
    const approvedBodies = new Map((revisions ?? []).map(revision => [revision.id, revision.body]));
    return data.flatMap(review => {
      const body = review.approved_revision_id ? approvedBodies.get(review.approved_revision_id) : undefined;
      return body ? [{ id: review.id, body }] : [];
    });
  } catch {
    return [];
  }
}

function Ornament() {
  return <div className={styles.ornament} aria-hidden="true"><span /><Sparkles size={25} strokeWidth={1} /><span /></div>;
}

export default async function Home() {
  const testimonies = await getFeaturedTestimonies();
  return <div className={styles.home}>
    <section className={styles.hero} aria-labelledby="sanctuary-title">
      <Image src="/images/sanctuary-dawn-v2.webp" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className={styles.heroArtwork} />
      <div className={styles.heroVeil} />
      <div className={styles.heroCenter}>
        <p className={styles.eyebrow}>Sacred knowledge &amp; healing for</p>
        <h1 id="sanctuary-title">Seraph<span>The Alchemist</span></h1>
        <Ornament />
        <p className={styles.heroDescription}>A sanctuary for the seeker.<br />A thread back to yourself.</p>
        <div className={styles.actions}>
          <a className={styles.button} href="#journey">Enter the sanctuary <ArrowRight size={15} /></a>
          <Link className={styles.button + ' ' + styles.secondary} href="/grimoire">Explore the Grimoire</Link>
        </div>
      </div>
      <aside className={styles.leftMantra} aria-label="Our intention"><p>Bridging<br />heaven<br />&amp; earth</p><span /><small>Heal<br />Explore<br />Integrate<br />Return</small></aside>
      <p className={styles.rightMantra}>Ancient wisdom<br />Modern souls<br />Real transformation</p>
    </section>
    <section id="journey" className={styles.journey} aria-labelledby="journey-title">
      <header className={styles.sectionHeading}><p className={styles.eyebrow}>Seven realms. One continuous thread.</p><h2 id="journey-title">Where does your journey begin?</h2></header>
      <div className={styles.realmGrid}>{realms.map((realm, index) => {
        const Icon = realmIcons[index];
        return <Link key={realm.id} href={'/chakras/' + chakraPages[realm.chakra].slug} className={styles.realmCard} style={{ '--realm-tint': realm.color } as CSSProperties}>
          <span className={styles.realmIcon}><Icon size={40} strokeWidth={1} /></span>
          <span className={styles.realmNumber}>0{index + 1}</span><span className={styles.chakraName}>{chakraPages[realm.chakra].name}</span>
          <h3>{realm.name}</h3><p>{realmDescriptions[index][0]}<br />{realmDescriptions[index][1]}</p>
          <span className={styles.realmEnter}>Explore this realm <ArrowRight size={12} /></span>
        </Link>;
      })}</div>
      <div className={styles.journeyFoot}><span /><Sparkles size={23} strokeWidth={1} /><p>From the roots of the earth to the stars above.</p><Sparkles size={23} strokeWidth={1} /><span /></div>
    </section>
    <section className={styles.approach} aria-labelledby="approach-title">
      <Image src="/images/sanctuary-portal-v2.webp" alt="A luminous crystal within a flowering stone doorway above the clouds" fill sizes="100vw" className={styles.approachArtwork} />
      <div className={styles.approachContent}>
        <div className={styles.approachIntro}>
          <h2 id="approach-title">More than healing.<br /><span>A remembering.</span></h2>
          <p>Through ancient wisdom and modern tools, we weave together the seen and unseen — helping you heal, transform, and return to the truth of who you are.</p>
          <Link href="/about" className={styles.button + ' ' + styles.secondary}>Explore my approach <ArrowRight size={15} /></Link>
        </div>
        <div className={styles.offerings}>
          {offerings.map(({ name, icon: Icon, href }) => <Link href={href} key={name}><Icon size={27} strokeWidth={1} /><span>{name}</span></Link>)}
          <p>Different paths.<br />The same light.</p>
        </div>
      </div>
      <div className={styles.discoverGrid}>
        <Link className={styles.discoverCard} href="/services"><div className={styles.cardImage + ' ' + styles.crystalImage}><Image src="/images/sanctuary-portal-v2.webp" alt="Glowing amethyst sanctuary" fill sizes="150px" /></div><div><h3>New here?</h3><p>Start with a reading and discover where you are on your path.</p><span>Begin your journey <ArrowRight size={14} /></span></div></Link>
        <Link className={styles.discoverCard} href="/services"><div className={styles.cardImage + ' ' + styles.dawnImage}><Image src="/images/sanctuary-dawn-v2.webp" alt="A celestial castle in the clouds" fill sizes="150px" /></div><div><h3>Explore services</h3><p>Readings, healing, teachings,<br />and more.</p><span>View all services <ArrowRight size={14} /></span></div></Link>
        <Link className={styles.discoverCard} href="/reviews"><div className={styles.cardImage + ' ' + styles.nightImage}><Image src="/images/sanctuary-starlight-v2.webp" alt="A star-filled sanctuary" fill sizes="150px" /><Orbit size={65} strokeWidth={.7} /></div><div><h3>Real experiences</h3><p>Stories from souls on the path.</p><span>Read testimonies <ArrowRight size={14} /></span></div></Link>
      </div>
    </section>
    <section className={styles.closing} aria-label="The thread continues">
      <Image src="/images/sanctuary-starlight-v2.webp" alt="" fill sizes="100vw" className={styles.closingArtwork} />
      <FeaturedTestimonies testimonies={testimonies} />
      <div className={styles.invitation}><p className={styles.eyebrow}>The thread is always here.</p><h2>Are you ready to follow it?</h2><Link className={styles.button} href="/services">Enter the sanctuary <ArrowRight size={15} /></Link><Ornament /></div>
      <footer className={styles.footer}><p>Heal · Explore · Integrate · Return</p><div><Link href="/terms-of-service">Terms of Service</Link><Link href="/privacy-policy">Privacy Policy</Link><Link href="/account" prefetch={false}>Your account</Link></div><p>© {new Date().getFullYear()} Seraph the Alchemist</p></footer>
    </section>
  </div>;
}
