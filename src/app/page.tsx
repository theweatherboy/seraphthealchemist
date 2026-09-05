"use client";
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { useRealm } from '@/context/RealmContext';
import { realms } from '@/data/realms';

export default function Home(){
 const {setRealm}=useRealm();
 const journey=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   const observer=new IntersectionObserver(entries=>{
     const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
     if(visible) setRealm((visible.target as HTMLElement).dataset.realm!);
   },{threshold:[.25,.6]});
   journey.current?.querySelectorAll('[data-realm]').forEach(el=>observer.observe(el));
   return ()=>observer.disconnect();
 },[setRealm]);
 return <div className="sanctuary-home">
   <section className="sanctuary-hero">
     <div className="hero-center">
       <p className="eyebrow">Bridging heaven &amp; earth</p>
       <Image src="/logo.png" width={130} height={130} alt="Seraph's dragon emblem" className="hero-emblem" priority/>
       <h1>Seraph<span>The Alchemist</span></h1>
       <p className="hero-mantra">Weave. Transform. Return.</p>
       <p className="hero-description">A sanctuary for the seeker. A thread back to yourself.</p>
       <div className="hero-actions"><a className="sanctuary-button" href="#journey">Enter the sanctuary <ArrowDown size={15}/></a><Link className="sanctuary-button subtle" href="/grimoire">Explore the Grimoire <ArrowUpRight size={15}/></Link></div>
     </div>
     <aside className="hero-panel earth-panel"><p className="eyebrow">Return to your center</p><h2>Rooted in the earthly.</h2><p>Grounding, protection, healing, and the quiet work of becoming.</p><Link href="/services">Find your practice <ArrowUpRight size={15}/></Link></aside>
     <aside className="hero-panel celestial-panel"><p className="eyebrow">Expand your awareness</p><h2>Open to the celestial.</h2><p>Symbolism, intuition, and wisdom for the path unfolding within.</p><Link href="/grimoire">Follow your curiosity <ArrowUpRight size={15}/></Link></aside>
     <a className="hero-scroll" href="#journey">Follow the thread <ArrowDown size={16}/></a>
   </section>
   <section id="journey" className="journey-section" ref={journey}>
     <div className="journey-heading"><p className="eyebrow">Seven realms. One continuous thread.</p><h2>Where does your journey begin?</h2><p>Follow what calls to you. Every path is part of the same weave.</p></div>
     <div className="realm-cards">{realms.map((realm,i)=><Link href={i===4||i===5||i===6?'/grimoire':'/services'} className="realm-card" key={realm.id} data-realm={realm.id} onMouseEnter={()=>setRealm(realm.id)} onFocus={()=>setRealm(realm.id)} style={{'--realm-color':realm.color,'--realm-position':(i*100/6)+'%'} as React.CSSProperties}>
       <span className="realm-number">0{i+1} / {realm.chakra.replace('thirdEye','third eye')}</span><h3>{realm.name}</h3>
       <div className="realm-sigil"><Sparkles size={34} strokeWidth={1}/></div>
       <p>{realm.subjects.join(' · ')}</p><span className="realm-enter">Enter path <ArrowUpRight size={14}/></span>
     </Link>)}</div>
     <div className="journey-footer"><span>From the roots of the earth to the stars above.</span><Link href="/about">Meet the Alchemist <ArrowUpRight size={16}/></Link></div>
   </section>
 </div>;
}
