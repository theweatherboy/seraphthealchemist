"use client";

import React from 'react';
import Link from 'next/link';

export default function GlobalNavigation() {
  return (
    <nav className="site-navigation" aria-label="Main navigation">
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
      <Link href="/about" className="hover:text-white transition-colors">About</Link>
      <Link href="/services" className="hover:text-white transition-colors">Services</Link>
      <Link href="/grimoire" className="hover:text-white transition-colors">Grimoire</Link>
      <Link href="/forge" className="hover:text-white transition-colors">Offerings</Link>
      <Link href="/support" className="hover:text-white transition-colors">Support</Link>
      <Link href="/contact" className="hover:text-white transition-colors">Connect</Link>
    </nav>
  );
}
