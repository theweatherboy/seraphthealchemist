"use client";

import { useEffect, useRef } from "react";
import { createWeaveRenderer } from "./weave-renderer";

export default function LivingTapestryCanvasV2() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const renderer = createWeaveRenderer(el);
    if (!renderer) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0, y: 0, strength: 0 };
    const target = { x: 0, y: 0, strength: 0 };
    let frame = 0, last = 0, time = 0, interval = 1000 / 45;

    const tick = (now: number) => {
      frame = 0;
      if (document.hidden) { last = 0; return; }
      const elapsed = last ? now-last : interval;
      if (elapsed >= interval-1) {
        const dt = Math.min(elapsed/1000, .08);
        last = now;
        if (!reducedMotion.matches) time += dt;
        const ease = 1-Math.exp(-dt*7);
        pointer.x += (target.x-pointer.x)*ease;
        pointer.y += (target.y-pointer.y)*ease;
        pointer.strength += (target.strength-pointer.strength)*ease;
        renderer.draw(time, reducedMotion.matches ? { ...pointer, strength:0 } : pointer);
      }
      if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const box = el.getBoundingClientRect();
      interval = 1000/(box.width < 700 ? 30 : 45);
      renderer.resize(box.width, box.height, window.devicePixelRatio || 1);
      restart();
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
      const box = el.getBoundingClientRect();
      target.x = event.clientX-box.left;
      target.y = event.clientY-box.top;
      if (pointer.strength < .015) { pointer.x=target.x; pointer.y=target.y; }
      target.strength=1;
    };
    const leave = () => { target.strength=0; };
    const preferencesChanged = () => { leave(); restart(); };
    const visibilityChanged = () => { leave(); restart(); };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive:true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibilityChanged);
    reducedMotion.addEventListener("change", preferencesChanged);
    finePointer.addEventListener("change", preferencesChanged);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", visibilityChanged);
      reducedMotion.removeEventListener("change", preferencesChanged);
      finePointer.removeEventListener("change", preferencesChanged);
    };
  }, []);

  return <div className="living-threads living-threads-canvas" aria-hidden="true"><canvas ref={canvas} /></div>;
}
