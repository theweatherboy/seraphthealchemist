import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, Eye, Heart, Leaf, Moon, Orbit, Sparkles, Sprout, Sun, Star } from 'lucide-react';
import { chakraPages, realms } from '@/data/realms';
import { createClient } from '@/lib/supabase/server';
import FeaturedTestimonies, { type FeaturedTestimony } from '@/components/features/FeaturedTestimonies';
import SceneBackdrop from '@/components/visual/SceneBackdrop';
import styles from './home.module.css';

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
      <SceneBackdrop poster="/images/sanctuary-dawn-clean-v1.webp" scene="dawn" className={styles.heroArtwork} label="sunrise sanctuary" priority />
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
      <header className={styles.sectionHeading}><p className={styles.eyebrow}>Nine realms. One continuous thread.</p><h2 id="journey-title">Where does your journey begin?</h2></header>
      <div className={styles.realmGrid}>{realms.map((realm, index) => {
        const Icon = realmIcons[index];
        return <Link key={realm.id} href={'/chakras/' + chakraPages[realm.chakra].slug} className={styles.realmCard} style={{ '--realm-tint': realm.color } as CSSProperties}>
          <span className={styles.realmIcon}><Icon size={40} strokeWidth={1} /></span>
          <span className={styles.realmNumber}>{String(chakraPages[realm.chakra].number).padStart(2, '0')}</span><span className={styles.chakraName}>{chakraPages[realm.chakra].name}</span>
          <h3>{realm.name}</h3><p>{realmDescriptions[index][0]}<br />{realmDescriptions[index][1]}</p>
          <span className={styles.realmEnter}>Explore this realm <ArrowRight size={12} /></span>
        </Link>;
      })}</div>
      <div className={styles.journeyFoot}><span /><Sparkles size={23} strokeWidth={1} /><p>From the roots of the earth to the stars above.</p><Sparkles size={23} strokeWidth={1} /><span /></div>
    </section>
    <section className={styles.approach} aria-labelledby="approach-title">
      <SceneBackdrop poster="/images/sanctuary-portal-clean-v1.webp" scene="portal" className={styles.approachArtwork} label="crystal sanctuary" />
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
    </section>
    <section className={styles.discover} aria-labelledby="discover-title">
      <SceneBackdrop poster="/images/sanctuary-dawn-clean-v1.webp" scene="dawn" className={styles.discoverArtwork} label="journey sanctuary" />
      <header className={styles.discoverHeading}><p className={styles.eyebrow}>Begin your journey</p><h2 id="discover-title">Explore what calls to you</h2></header>
      <div className={styles.discoveryCards}>
        {[
          { title: 'New here?', copy: 'Start with a reading and discover where you are on your path.', action: 'Begin your journey', href: '/services', image: 'portal', emblem: Sparkles },
          { title: 'Explore services', copy: 'Readings, healing, teachings, and more.', action: 'View all services', href: '/services', image: 'dawn', emblem: Sun },
          { title: 'Real experiences', copy: 'Stories from souls on the path.', action: 'Read testimonies', href: '/reviews', image: 'starlight', emblem: Moon },
        ].map(({title,copy,action,href,image,emblem:Emblem},index) => <Link className={styles.discoveryCard} href={href} key={title}>
          <div className={styles.discoveryFrame}>
            <div className={styles.discoveryImage} data-art={image}><Image src={'/images/sanctuary-'+image+'-v2.webp'} alt="" fill sizes="(max-width: 600px) 40vw, (max-width: 1100px) 260px, 23vw" />{image==='starlight' && <Orbit size={70} strokeWidth={.7}/>}</div>
            <Emblem className={styles.discoveryEmblem} size={31} strokeWidth={1} aria-hidden="true" />
            <span className={styles.discoveryJewel} aria-hidden="true">✧</span>
          </div>
          <div className={styles.discoveryCopy}><span className={styles.discoveryNumber}>0{index+1}<i/></span><h3>{title}</h3><p>{copy}</p><span className={styles.discoveryAction}>{action}<ArrowRight size={17}/></span></div>
        </Link>)}
      </div>
      <footer className={styles.discoveryFoot}><span aria-hidden="true">☽ · ☼ · ☾</span><p>Different paths. The same light.</p></footer>
    </section>
    <section className={styles.closing} aria-label="The thread continues">
      <SceneBackdrop poster="/images/sanctuary-starlight-clean-v1.webp" scene="starlight" className={styles.closingArtwork} label="starlight sanctuary" />
      <FeaturedTestimonies testimonies={testimonies} />
      <div className={styles.invitation}><p className={styles.eyebrow}>The thread is always here.</p><h2>Are you ready to follow it?</h2><Link className={styles.button} href="/services">Enter the sanctuary <ArrowRight size={15} /></Link><Ornament /></div>
      <footer className={styles.footer}><p>Heal · Explore · Integrate · Return</p><div><Link href="/terms-of-service">Terms of Service</Link><Link href="/privacy-policy">Privacy Policy</Link><Link href="/account" prefetch={false}>Your account</Link></div><p>© {new Date().getFullYear()} Seraph the Alchemist</p></footer>
    </section>
  </div>;
}
