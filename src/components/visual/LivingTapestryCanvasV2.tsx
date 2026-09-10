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
    let frame = 0, last = 0, time = 0, interval = 1000 / 45, resizeFrame = 0;
    let dimensions = { width: 0, height: 0 };

    const renderNow = () => renderer.draw(time, reducedMotion.matches ? { ...pointer, strength:0 } : pointer);

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
        renderNow();
      }
      if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = (force = false) => {
      const box = el.getBoundingClientRect();
      const width = Math.round(box.width), height = Math.round(box.height);
      const widthChanged = Math.abs(width-dimensions.width) > 1;
      const heightChanged = Math.abs(height-dimensions.height) > 1;
      const mobile = width < 700;
      // Mobile browsers repeatedly alter viewport height while their chrome moves.
      // The previous frame remains valid through those small changes, avoiding a flash.
      if (!force && !widthChanged && (!heightChanged || (mobile && Math.abs(height-dimensions.height) < 160))) return;
      dimensions = { width, height };
      interval = 1000/(mobile ? 30 : 45);
      renderer.resize(width, height, window.devicePixelRatio || 1);
      renderNow();
      restart();
    };
    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => resize());
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
    const preferencesChanged = () => { leave(); renderNow(); restart(); };
    const visibilityChanged = () => { leave(); restart(); };
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(el);
    resize(true);
    window.addEventListener("resize", scheduleResize);
    window.addEventListener("pointermove", move, { passive:true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibilityChanged);
    reducedMotion.addEventListener("change", preferencesChanged);
    finePointer.addEventListener("change", preferencesChanged);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleResize);
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
