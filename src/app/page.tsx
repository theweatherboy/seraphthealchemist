"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Scene from '@/components/canvas/Scene';
import Stars from '@/components/canvas/Stars';
import Dragon from '@/components/canvas/Dragon';
import CelestialWheel from '@/components/canvas/CelestialWheel';
import Link from 'next/link';
import ArcaneSigil from '@/components/ui/arcane/ArcaneSigil';

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Immersive 3D Background */}
      <Scene>
        <Stars />
        <CelestialWheel />
        <Dragon />
      </Scene>

      {/* UI Overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8">
          {/* The Focal Sigil */}
          <div className="absolute inset-0 flex items-center justify-center scale-150 opacity-50 blur-sm">
             <ArcaneSigil size={200} />
          </div>
          <div className="relative z-10">
             <ArcaneSigil size={120} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="font-arcane text-5xl md:text-7xl text-seraphic-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
            The Seraphim Sanctuary
          </h1>
          <p className="font-celestial text-xl md:text-2xl text-moon-ivory/80 mb-12 leading-relaxed">
            An interactive digital sanctuary for exploring consciousness, spirituality, mysticism, and the transformation of the self.
          </p>

          <Link
            href="/grimoire"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-arcane text-xl text-seraphic-gold transition-all duration-300 border border-seraphic-gold hover:bg-seraphic-gold hover:text-obsidian overflow-hidden"
          >
            <span className="relative z-10">ENTER THE SANCTUM</span>
            <div className="absolute inset-0 w-0 bg-seraphic-gold transition-all duration-300 group-hover:w-full" />
          </Link>
        </motion.div>
      </div>

      {/* Ambient Footer */}
      <div className="absolute bottom-8 left-0 w-full text-center z-10">
        <p className="font-celestial text-sm text-moon-ivory/40 uppercase tracking-widest animate-pulse">
          Scroll to drift through the void
        </p>
      </div>
    </div>
  );
}
