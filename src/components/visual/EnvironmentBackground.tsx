"use client";
import {useRealm} from '@/context/RealmContext';
export default function EnvironmentBackground(){
 const {currentRealm}=useRealm();
 return <div className="sanctuary-environment" aria-hidden="true"><div className="sanctuary-art"/><div className="sanctuary-shade"/><div className="realm-atmosphere" style={{background:'radial-gradient(ellipse at 15% 80%, '+currentRealm.color+'35, transparent 65%)'}}/></div>;
}