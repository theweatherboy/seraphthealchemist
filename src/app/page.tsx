import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, Eye, Heart, Leaf, Moon, Orbit, Sparkles, Sprout, Sun, Star } from 'lucide-react';
import { chakraPages, realms } from '@/data/realms';
import { createClient } from '@/lib/supabase/server';
import FeaturedTestimonies, { type FeaturedTestimony } from '@/components/features/FeaturedTestimonies';
import styles from './earthly-home.module.css';

const realmIcons = [Sprout, Leaf, Moon, Sun, Heart, Moon, Eye, Orbit, Star];
const realmDescriptions = [
  ['Earth Connection', 'Belonging · Embodiment'],
  ['Grounding · Protection', 'Presence · Energy Hygiene'],
  ['Emotion · Creativity', 'Energy · Movement'],
  ['Transformation · Will', 'Shadow Work · Alchemy'],
  ['Compassion · Integration', 'Reiki · Inner Union'],
  ['Mysticism · Symbolism', 'Spiritual Study'],
  ['Intuition · Dreams', 'Divination · Astral'],
  ['Angels · Seraphim', 'Higher Consciousness'],
  ['Soul Purpose · Higher Self', 'Spiritual Integration'],
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
      <Image src="/images/earthly-sanctuary-v1.webp" alt="" fill sizes="100vw" className={styles.heroArtwork} priority />
      <div className={styles.heroVeil} />
      <div className={styles.heroCenter}>
        <div className={styles.sunSeal} aria-hidden="true"><svg viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="27" /><circle cx="60" cy="60" r="22" />{Array.from({ length:32 },(_,i)=>{const angle=i*Math.PI/16;const radius=i%4===0?58:i%2===0?47:36;return <line key={i} x1={60+29*Math.cos(angle)} y1={60+29*Math.sin(angle)} x2={60+radius*Math.cos(angle)} y2={60+radius*Math.sin(angle)}/>;})}<path d="M60 39 65 55 81 60 65 65 60 81 55 65 39 60 55 55Z"/><circle cx="60" cy="60" r="9"/></svg></div>
        <p className={styles.eyebrow}>Sacred knowledge &amp; healing</p>
        <h1 id="sanctuary-title">Seraph<span>The Alchemist</span></h1>
        <Ornament />
        <p className={styles.heroDescription}>A sanctuary for the seeker.<br />A thread back to yourself.</p>
        <div className={styles.actions}>
          <Link className={styles.button} href="/services">Begin the journey <ArrowRight size={15} /></Link>
          <a className={styles.button + ' ' + styles.secondary} href="#journey">Explore the paths</a>
        </div>
      </div>
      <aside className={styles.leftMantra} aria-label="Our intention"><p>Rooted<br />in the earth,<br />guided<br />by the stars.</p><Sparkles size={24} strokeWidth={1} /></aside>
      <p className={styles.rightMantra}>Seek<br />Heal<br />Align<br />Transform<br />Remember<br />Return</p>
    </section>
    <div className={styles.parchment}>
    <section id="journey" className={styles.journey} aria-labelledby="journey-title">
      <header className={styles.sectionHeading}><p className={styles.eyebrow}>Nine realms. One continuous thread.</p><h2 id="journey-title">Where does your journey begin?</h2></header>
      <div className={styles.realmGrid}>{realms.map((realm, index) => {
        const Icon = realmIcons[index];
        return <Link key={realm.id} href={'/chakras/' + chakraPages[realm.chakra].slug} className={styles.realmCard} style={{ '--realm-tint': realm.color } as CSSProperties}>
          <span className={styles.realmIcon}><Icon size={40} strokeWidth={1} /></span>
          <span className={styles.realmNumber}>{String(chakraPages[realm.chakra].number).padStart(2, '0')}</span><span className={styles.chakraName}>{chakraPages[realm.chakra].name}</span>
          <h3>{realm.chakra === 'root' ? 'Root' : realm.name}</h3><p>{realmDescriptions[index][0]}<br />{realmDescriptions[index][1]}</p>
          <span className={styles.realmEnter}>Explore this realm <ArrowRight size={12} /></span>
        </Link>;
      })}</div>
      <div className={styles.journeyFoot}><span /><Sparkles size={23} strokeWidth={1} /><p>From the roots of the earth to the stars above.</p><Sparkles size={23} strokeWidth={1} /><span /></div>
    </section>
    <section className={styles.approach} aria-labelledby="approach-title">
      <div className={styles.approachContent}>
        <div className={styles.approachIntro}>
          <h2 id="approach-title">More than healing. <span>A remembering.</span></h2>
          <p>Through ancient wisdom and modern tools, we weave together the seen and unseen — helping you heal, transform, and return to the truth of who you are.</p>
          <Link href="/about" className={styles.button + ' ' + styles.secondary}>Explore my approach <ArrowRight size={15} /></Link>
        </div>
        <div className={styles.offerings}>
          {offerings.map(({ name, icon: Icon, href }) => <Link href={href} key={name}><Icon size={27} strokeWidth={1} /><span>{name}</span></Link>)}
          <p>Different paths.<br />The same light.</p>
        </div>
      </div>
    </section>
    <section className={styles.discover} aria-labelledby="discover-title">
      <header className={styles.discoverHeading}><p className={styles.eyebrow}>Begin your journey</p><h2 id="discover-title">Explore what calls to you</h2></header>
      <div className={styles.discoveryCards}>
        {[
          { title: 'New here?', copy: 'Start with a reading and discover where you are on your path.', action: 'Begin your journey', href: '/services', image: 'portal', emblem: Sparkles },
          { title: 'Explore services', copy: 'Readings, healing, teachings, and more.', action: 'View all services', href: '/services', image: 'dawn', emblem: Sun },
          { title: 'Real experiences', copy: 'Stories from souls on the path.', action: 'Read testimonies', href: '/reviews', image: 'starlight', emblem: Moon },
        ].map(({title,copy,action,href,image,emblem:Emblem},index) => <Link className={styles.discoveryCard} href={href} key={title}>
          <div className={styles.discoveryFrame}>
            <div className={styles.discoveryImage} data-art={image}><Image src={image === 'dawn' ? '/images/earthly-sanctuary-v1.webp' : '/images/earthly-homecoming-v1.webp'} alt="" fill sizes="(max-width: 600px) 40vw, 220px" />{image==='starlight' && <Moon size={45} strokeWidth={.7}/>}</div>
            <Emblem className={styles.discoveryEmblem} size={31} strokeWidth={1} aria-hidden="true" />
            <span className={styles.discoveryJewel} aria-hidden="true">✧</span>
          </div>
          <div className={styles.discoveryCopy}><span className={styles.discoveryNumber}>0{index+1}<i/></span><h3>{title}</h3><p>{copy}</p><span className={styles.discoveryAction}>{action}<ArrowRight size={17}/></span></div>
        </Link>)}
      </div>
      <footer className={styles.discoveryFoot}><span aria-hidden="true">☽ · ☼ · ☾</span><p>Different paths. The same light.</p></footer>
    </section>
    </div>
    <section className={styles.closing} aria-label="The thread continues">
      <Image src="/images/earthly-homecoming-v1.webp" alt="" fill sizes="100vw" className={styles.closingArtwork} />
      <FeaturedTestimonies testimonies={testimonies} />
      <div className={styles.invitation}><Link className={styles.button} href="/services">Begin your journey <ArrowRight size={15} /></Link><Ornament /></div>
      <footer className={styles.footer}><p>Heal · Explore · Integrate · Return</p><div><Link href="/terms-of-service">Terms of Service</Link><Link href="/privacy-policy">Privacy Policy</Link><Link href="/account" prefetch={false}>Your account</Link></div><p>© {new Date().getFullYear()} Seraph the Alchemist</p></footer>
    </section>
  </div>;
}
