"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRealm } from '@/context/RealmContext';
import { realms } from '@/data/realms';
import NavigationPopup from '@/components/ui/NavigationPopup';
import { useState, useEffect } from 'react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { setRealm } = useRealm();
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowPopup(true);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      realms.forEach((realm, idx) => {
        ScrollTrigger.create({
          trigger: `#realm-${realm.id}`,
          start: "top center",
          end: "bottom center",
          onEnter: () => setRealm(realm.id),
          onEnterBack: () => setRealm(realm.id),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [setRealm]);

  return (
    <div ref={containerRef} className="relative w-full">
      <NavigationPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <img
              src="/logo.png"
              alt="Threads of Divinity Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            />
          </div>
          <div className="text-center">
            <p className="font-arcane text-xl md:text-2xl text-gold/80 mb-12 uppercase tracking-[0.3em]">
              Weave. Transform. Return.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/sanctuary"
              className="px-10 py-4 font-arcane text-xl text-gold border border-gold/50 hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-full"
            >
              ENTER SANCTUARY
            </Link>
            <Link
              href="/grimoire"
              className="px-10 py-4 font-arcane text-xl text-gold border border-gold/50 hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-full"
            >
              EXPLORE GRIMOIRE
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Realm Sections */}
      {realms.map((realm, idx) => (
        <section
          key={realm.id}
          id={`realm-${realm.id}`}
          className="relative h-screen w-full flex flex-col items-center justify-center px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="max-w-3xl"
          >
            <h2
              className="font-arcane text-4xl md:text-7xl mb-6 tracking-widest transition-colors duration-1000"
              style={{ color: realm.color }}
            >
              {realm.name.toUpperCase()}
            </h2>
            <p className="font-celestial text-xl md:text-2xl text-muted mb-8 italic">
              {idx === 0 ? "Begin by returning to yourself." :
               idx === 1 ? "Let energy move." :
               idx === 2 ? "Transformation begins within." :
               idx === 3 ? "Integration is the bridge." :
               idx === 4 ? "Give language to what you discover." :
               idx === 5 ? "Look beyond the visible." :
               "Reach upward without abandoning Earth."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {realm.subjects.map(subject => (
                <span
                  key={subject}
                  className="px-4 py-1 rounded-full border border-white/10 bg-white/5 text-sm font-celestial text-muted"
                >
                  {subject}
                </span>
              ))}
            </div>
          </motion.div>
        </section>
      ))}

      {/* Final Convergence */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-2xl">
          <h2 className="font-arcane text-4xl text-gold mb-8">The Great Weave</h2>
          <p className="font-celestial text-lg text-muted mb-12">
            All threads converge. Earth and Heaven are revealed as one.
          </p>
          <Link
            href="/contact"
            className="px-12 py-4 font-arcane text-xl text-gold border border-gold/50 hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-full"
          >
            BEGIN YOUR JOURNEY
          </Link>
        </div>
      </section>
    </div>
  );
}
