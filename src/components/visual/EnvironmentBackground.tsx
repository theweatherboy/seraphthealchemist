"use client";
import {useRealm} from '@/context/RealmContext';
import {usePathname} from 'next/navigation';
import {chakraNavigation} from '@/data/realms';
import {pageArtwork, pageArtworkSource} from '@/lib/page-artwork';
export default function EnvironmentBackground(){
 const {currentRealm}=useRealm();
 const pathname=usePathname();
 const chakra=chakraNavigation.find(item=>pathname===`/chakras/${item.slug}`);
 const artwork=pageArtwork(pathname);
 const source = chakra ? `/images/chakras/${chakra.slug}-v2.webp` : pageArtworkSource(artwork);
 return <div className="sanctuary-environment" data-chakra={chakra ? 'true' : undefined} aria-hidden="true"><div className="sanctuary-art" style={{backgroundImage:`url('${source}')`}}/><div className="sanctuary-shade"/><div className="realm-atmosphere" style={{background:'radial-gradient(ellipse at 15% 80%, '+currentRealm.color+'15, transparent 65%)'}}/></div>;
}
