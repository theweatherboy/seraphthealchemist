"use client";
import {useRealm} from '@/context/RealmContext';
import {usePathname} from 'next/navigation';
import {chakraNavigation} from '@/data/realms';
import {pageArtwork} from '@/lib/page-artwork';
export default function EnvironmentBackground(){
 const {currentRealm}=useRealm();
 const pathname=usePathname();
 const chakra=chakraNavigation.find(item=>pathname===`/chakras/${item.slug}`);
 const artwork=pageArtwork(pathname);
 return <div className="sanctuary-environment" data-chakra={chakra ? 'true' : undefined} aria-hidden="true"><div className="sanctuary-art" style={{backgroundImage:`url('/images/${chakra ? `chakras/${chakra.slug}-v1` : artwork ? `pages/${artwork}-v1` : 'earthly-homecoming-v1'}.webp')`}}/><div className="sanctuary-shade"/><div className="realm-atmosphere" style={{background:'radial-gradient(ellipse at 15% 80%, '+currentRealm.color+'15, transparent 65%)'}}/></div>;
}
