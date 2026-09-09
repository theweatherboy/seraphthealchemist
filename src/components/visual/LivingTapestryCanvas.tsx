"use client";
import { useEffect, useRef } from 'react';

type Strand = { phase:number; speed:number; width:number; alpha:number; amp:number; depth:number; hue:number; bias:number; seed:number };
const palette = ['#d66b43','#f1b84f','#d8d07b','#8fca8a','#71d2d5','#76a9e8','#8d87dd','#c397e8'];
const strands: Strand[] = Array.from({ length: 108 }, (_, i) => ({ phase:Math.random()*Math.PI*2, speed:.00012+Math.random()*.00028, width:.3+Math.random()*1.15, alpha:.06+Math.random()*.4, amp:14+Math.random()*72, depth:Math.random(), hue:i/107*7+(Math.random()-.5)*.8, bias:(Math.random()-.5)*.9, seed:Math.random()*1000 }));

export default function LivingTapestryCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current; const ctx=canvas?.getContext('2d'); if(!canvas||!ctx)return;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; let w=0,h=0,dpr=1,raf=0,start=performance.now(); let pointer={x:0,y:0,active:false};
    const resize=()=>{const b=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.5);w=b.width;h=b.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
    const move=(e:PointerEvent)=>{pointer={x:e.clientX,y:e.clientY,active:true};}; const leave=()=>{pointer.active=false;}; resize(); window.addEventListener('resize',resize); window.addEventListener('pointermove',move,{passive:true}); window.addEventListener('pointerleave',leave);
    const draw=(now:number)=>{const t=reduce?0:now-start;ctx.clearRect(0,0,w,h);const fx=w*(.48+Math.sin(t*.00008)*.12),fy=h*(.53+Math.cos(t*.00011)*.08); strands.forEach((s,index)=>{const pts:{x:number;y:number}[]=[];const base=h*(.52+s.bias*.28);for(let k=0;k<=18;k++){const p=k/18,x=w*(p*1.18-.09);const wave=Math.sin(p*8.2+s.phase+t*s.speed)*s.amp+Math.sin(p*17+s.seed)*s.amp*.24;const gather=Math.exp(-Math.pow((p-.55-s.bias*.12)*4,2))*(fy-base)*(.25+s.depth*.55);let y=base+wave+gather+(p-.5)*s.bias*70;if(pointer.active){const dx=x-pointer.x,dy=y-pointer.y,dist=Math.sqrt(dx*dx+dy*dy),pull=Math.max(0,1-dist/230);y+=(pointer.y-y)*pull*.18;}pts.push({x,y});}ctx.beginPath();pts.forEach((p,i)=>{if(i===0)ctx.moveTo(p.x,p.y);else{const q=pts[i-1];ctx.quadraticCurveTo(q.x+(p.x-q.x)*.5,q.y+(p.y-q.y)*.5,p.x,p.y);}});ctx.strokeStyle=palette[Math.max(0,Math.min(7,Math.floor(s.hue)))];ctx.globalAlpha=s.alpha*(.55+s.depth*.7);ctx.lineWidth=s.width*(.7+s.depth);ctx.lineCap='round';ctx.stroke();if(index%21===0){ctx.globalAlpha=.65;ctx.lineWidth=1;ctx.strokeStyle='#fff4d5';ctx.stroke();}});ctx.globalAlpha=1;if(!reduce)raf=requestAnimationFrame(draw);}; draw(performance.now()); return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerleave',leave);};
  }, []);
  return <div className="living-threads living-threads-canvas" aria-hidden="true"><canvas ref={ref} /></div>;
}
