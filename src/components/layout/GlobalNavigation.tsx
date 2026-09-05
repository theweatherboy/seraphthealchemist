"use client";

import React from 'react';
import Link from 'next/link';

export default function GlobalNavigation() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)] shadow-xl flex items-center gap-8 text-sm font-arcane uppercase tracking-widest text-gold">
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
      <Link href="/about" className="hover:text-white transition-colors">About</Link>
      <Link href="/services" className="hover:text-white transition-colors">Services</Link>
      <Link href="/grimoire" className="hover:text-white transition-colors">Grimoire</Link>
      <Link href="/offerings" className="hover:text-white transition-colors">Offerings</Link>
      <Link href="/journal" className="hover:text-white transition-colors">Journal</Link>
      <Link href="/connect" className="hover:text-white transition-colors">Connect</Link>
    </nav>
  );
}
