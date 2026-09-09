"use client";
import { useEffect, useRef } from 'react';

type Strand = { phase:number; speed:number; width:number; alpha:number; amp:number; depth:number; hue:number; bias:number; seed:number };
const palette = ['#d66b43','#f1b84f','#d8d07b','#8fca8a','#71d2d5','#76a9e8','#8d87dd','#c397e8'];
const strands: Strand[] = Array.from({ length: 58 }, (_, i) => ({ phase:Math.random()*Math.PI*2, speed:.0001+Math.random()*.0002, width:.28+Math.random()*.8, alpha:.035+Math.random()*.22, amp:8+Math.random()*42, depth:Math.random(), hue:i/57*7+(Math.random()-.5)*.8, bias:(Math.random()-.5)*.9, seed:Math.random()*1000 }));

export default function LivingTapestryCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current; const ctx=canvas?.getContext('2d'); if(!canvas||!ctx)return;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; let w=0,h=0,dpr=1,raf=0,start=performance.now(); let pointer={x:0,y:0,active:false};
    const resize=()=>{const b=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.5);w=b.width;h=b.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
    const move=(e:PointerEvent)=>{pointer={x:e.clientX,y:e.clientY,active:true};}; const leave=()=>{pointer.active=false;}; resize(); window.addEventListener('resize',resize); window.addEventListener('pointermove',move,{passive:true}); window.addEventListener('pointerleave',leave);
    const draw=(now:number)=>{const t=reduce?0:now-start;ctx.clearRect(0,0,w,h);const fy=h*(.53+Math.cos(t*.00011)*.08); strands.forEach((s,index)=>{const pts:{x:number;y:number}[]=[];const base=h*(.52+s.bias*.28);for(let k=0;k<=32;k++){const p=k/32,x=w*(p*1.18-.09);const wave=Math.sin(p*2.8+s.phase+t*s.speed)*s.amp+Math.sin(p*6.5+s.seed)*s.amp*.18;const gather=Math.exp(-Math.pow((p-.55-s.bias*.12)*4,2))*(fy-base)*(.2+s.depth*.4);let y=base+wave+gather+(p-.5)*s.bias*55;if(pointer.active){const dx=x-pointer.x,dy=y-pointer.y,dist=Math.sqrt(dx*dx+dy*dy),pull=Math.max(0,1-dist/230);y+=(pointer.y-y)*pull*.12;}pts.push({x,y});}ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length-1;i++){const a=pts[i-1],p=pts[i],b=pts[i+1];ctx.bezierCurveTo(a.x+(p.x-(i>1?pts[i-2].x:a.x))/6,a.y+(p.y-(i>1?pts[i-2].y:a.y))/6,b.x-(b.x-(i<pts.length-2?pts[i+2].x:b.x))/6,b.y-(b.y-(i<pts.length-2?pts[i+2].y:b.y))/6,p.x,p.y);}const last=pts[pts.length-1],prev=pts[pts.length-2];ctx.quadraticCurveTo(prev.x+(last.x-prev.x)*.5,prev.y+(last.y-prev.y)*.5,last.x,last.y);ctx.strokeStyle=palette[Math.max(0,Math.min(7,Math.floor(s.hue)))];ctx.globalAlpha=s.alpha*(.45+s.depth*.6);ctx.lineWidth=s.width*(.65+s.depth*.7);ctx.lineCap='round';ctx.stroke();if(index%23===0){ctx.globalAlpha=.42;ctx.lineWidth=1.1;ctx.strokeStyle='#fff4d5';ctx.stroke();}});ctx.globalAlpha=1;if(!reduce)raf=requestAnimationFrame(draw);}; draw(performance.now()); return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerleave',leave);};
  }, []);
  return <div className="living-threads living-threads-canvas" aria-hidden="true"><canvas ref={ref} /></div>;
}
