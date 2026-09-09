"use client";
import { useRealm } from '@/context/RealmContext';
const threads = Array.from({length:24},(_,i)=>{
 const s=(i-11.5)*9;
 const bend=(i%4-1.5)*24;
 return `M -120 ${430+s} C 120 ${230+s+bend}, 280 ${690-s}, 520 ${455+s*.2} S 820 ${285-s-bend}, 1050 ${425+s*.45} S 1320 ${610+s}, 1560 ${270+s}`;
});
export default function LivingTapestry(){
 const {currentRealm}=useRealm();
 return <div className="living-threads" aria-hidden="true"><svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
 <defs><linearGradient id="weave-spectrum" x1="0%" x2="100%"><stop offset="0%" stopColor="#d75d3d"/><stop offset="20%" stopColor="#f6bf54"/><stop offset="43%" stopColor="#b9df8a"/><stop offset="64%" stopColor="#71d6ec"/><stop offset="82%" stopColor="#8d91ef"/><stop offset="100%" stopColor="#d39bed"/></linearGradient><filter id="weave-halo" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="10"/></filter><filter id="weave-soft" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
 <g className="thread-drift" fill="none" stroke="url(#weave-spectrum)">
 <g filter="url(#weave-halo)" opacity=".4">{threads.filter((_,i)=>i%3===0).map((d,i)=><path key={i} d={d} strokeWidth="15"/>)}</g><g filter="url(#weave-soft)" opacity=".65">{threads.filter((_,i)=>i%2===0).map((d,i)=><path key={i} d={d} strokeWidth="5"/>)}</g>
 {threads.map((d,i)=><path key={i} d={d} strokeWidth={i%4===0?2.1:1.05} opacity={i%4===0?.9:.48} strokeLinecap="round"/>)}
 {threads.filter((_,i)=>i%4===0).map((d,i)=><path key={i} className="thread-spark" d={d} pathLength="1000" stroke="#fff2d8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 998" style={{animationDelay:(-i*4)+'s'}}/>)}
 <path d={threads[7]} stroke={currentRealm.color} strokeWidth="3" opacity=".4" className="realm-thread"/>
 </g></svg></div>;
}
