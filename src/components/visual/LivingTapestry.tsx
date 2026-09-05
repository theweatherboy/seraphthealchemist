"use client";
import { useRealm } from '@/context/RealmContext';
const threads = Array.from({length:16},(_,i)=>{
 const s=(i-7.5)*7;
 return 'M -100 '+(410+s)+' C 180 '+(240+s)+', 280 '+(650-s)+', 510 '+(460+s*.25)+' S 820 '+(300-s)+', 1040 '+(430+s*.4)+' S 1330 '+(550+s)+', 1540 '+(280+s);
});
export default function LivingTapestry(){
 const {currentRealm}=useRealm();
 return <div className="living-threads" aria-hidden="true"><svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
 <defs><linearGradient id="weave-spectrum" x1="0%" x2="100%"><stop offset="0%" stopColor="#ce7041"/><stop offset="26%" stopColor="#f6ce78"/><stop offset="47%" stopColor="#a7cf99"/><stop offset="66%" stopColor="#8fdaef"/><stop offset="100%" stopColor="#bd94ed"/></linearGradient><filter id="weave-halo" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="5"/></filter></defs>
 <g className="thread-drift" fill="none" stroke="url(#weave-spectrum)">
 <g filter="url(#weave-halo)" opacity=".32">{threads.filter((_,i)=>i%3===0).map((d,i)=><path key={i} d={d} strokeWidth="5"/>)}</g>
 {threads.map((d,i)=><path key={i} d={d} strokeWidth={i%4===0?1.3:.65} opacity={i%4===0?.85:.35}/>)}
 {threads.filter((_,i)=>i%4===0).map((d,i)=><path key={i} className="thread-spark" d={d} pathLength="1000" stroke="#fff2d8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 998" style={{animationDelay:(-i*4)+'s'}}/>)}
 <path d={threads[7]} stroke={currentRealm.color} strokeWidth="3" opacity=".4" className="realm-thread"/>
 </g></svg></div>;
}