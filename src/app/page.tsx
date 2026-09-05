"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scene from '@/components/canvas/Scene';
import Stars from '@/components/canvas/Stars';
import Dragon from '@/components/canvas/Dragon';
import Angel from '@/components/canvas/Angel';
import TapestryWheel from '@/components/canvas/TapestryWheel';
import JourneySection from '@/components/features/JourneySection';
import NavigationPopup from '@/components/ui/NavigationPopup';
import Link from 'next/link';
import ArcaneSigil from '@/components/ui/arcane/ArcaneSigil';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

const SITE_SEQUENCE = ['/', '/grimoire', '/services', '/forge', '/support', '/legal', '/contact'];

const PATHS = [
  { name: 'Root', label: 'Grounding', color: 'text-red-500', desc: 'Root into the present moment.' },
  { name: 'Sacral', label: 'Protection', color: 'text-orange-500', desc: 'Shield your energy.' },
  { name: 'Solar Plexus', label: 'Healing', color: 'text-yellow-500', desc: 'Restore your power.' },
  { name: 'Heart', label: 'Energy Work', color: 'text-green-500', desc: 'Balance your energy.' },
  { name: 'Throat', label: 'Divination', color: 'text-blue-500', desc: 'See clearly.' },
  { name: 'Third Eye', label: 'Astral Travel', color: 'text-indigo-500', desc: 'Explore beyond physical.' },
  { name: 'Crown', label: 'Higher Realms', color: 'text-purple-500', desc: 'Connect with divine wisdom.' },
];

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  useScrollNavigation(0, SITE_SEQUENCE);

  useEffect(() => {
    setShowPopup(true);
  }, []);

  return (
    <div className="relative w-full bg-obsidian text-moon-ivory">
      <NavigationPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />

      {/* Immersive 3D Background (Fixed/Absolute) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene>
          <Stars />
          <TapestryWheel />
          <Dragon />
          <Angel position={[-5, 2, -2]} scale={0.8} />
          <Angel position={[5, -2, -3]} scale={1.2} />
          <Angel position={[0, 5, -5]} scale={1} />
        </Scene>>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4">
          <div className="relative mb-8">
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
            className="max-w-4xl"
          >
            <h1 className="font-arcane text-6xl md:text-9xl text-seraphic-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] tracking-tighter">
              THREADS <br /> OF DIVINITY
            </h1>
            <p className="font-arcane text-xl md:text-2xl text-seraphic-gold/80 mb-4 uppercase tracking-[0.3em]">
              Weave. Transform. Ascend.
            </p>
            <p className="font-celestial text-lg md:text-xl text-moon-ivory/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              A sacred space for spiritual exploration, alchemy, and transformation.
              Enter the sanctuary to rediscover the divine geometry of your soul.
            </p>

            <Link
              href="/grimoire"
              className="group relative inline-flex items-center justify-center px-10 py-4 font-arcane text-xl text-seraphic-gold transition-all duration-300 border border-seraphic-gold hover:bg-seraphic-gold hover:text-obsidian overflow-hidden"
            >
              <span className="relative z-10">ENTER THE SANCTUM</span>
              <div className="absolute inset-0 w-0 bg-seraphic-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          </motion.div>

          <div className="absolute bottom-12 left-0 w-full text-center">
            <p className="font-celestial text-xs text-moon-ivory/40 uppercase tracking-widest animate-bounce">
              Scroll to drift through the realms
            </p>
          </div>
        </div>

        {/* The Seven Paths Section */}
        <div className="relative py-32 px-4 bg-gradient-to-b from-transparent via-void-purple/50 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-arcane text-4xl md:text-6xl text-seraphic-gold mb-4 tracking-widest">
                THE SEVEN PATHS
              </h2>
              <p className="font-celestial text-moon-ivory/60">
                Each center is a gateway to a higher state of consciousness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {PATHS.map((path, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative p-6 border border-seraphic-gold/20 bg-obsidian/40 backdrop-blur-md rounded-xl hover:border-seraphic-gold/50 transition-all duration-300"
                >
                  <div className={`font-arcane text-xs uppercase tracking-widest mb-2 ${path.color}`}>
                    Path {idx + 1}
                  </div>
                  <h3 className="font-arcane text-2xl text-seraphic-gold mb-2 group-hover:translate-x-1 transition-transform">
                    {path.name}
                  </h3>
                  <p className="font-celestial text-sm text-moon-ivory/60 mb-4 italic">
                    {path.label}
                  </p>
                  <p className="font-celestial text-sm text-moon-ivory/40">
                    {path.desc}
                  </p>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-seraphic-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Journey Section */}
        <JourneySection />

        {/* Final Call to Action */}
        <div className="relative py-32 text-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-arcane text-4xl text-seraphic-gold mb-8">Ready to Begin Your Ascent?</h2>
            <Link
              href="/contact"
              className="inline-block px-12 py-4 font-arcane text-xl text-seraphic-gold border border-seraphic-gold hover:bg-seraphic-gold hover:text-obsidian transition-all duration-300 rounded-full"
            >
              CONNECT WITH THE ALCHEMIST
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
