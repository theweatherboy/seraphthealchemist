"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="relative pt-32 pb-20 px-4 w-full min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-arcane text-5xl md:text-7xl text-gold mb-6 tracking-widest"
          >
            THE ALCHEMIST
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-celestial text-xl text-muted"
          >
            Seraph
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <section className="space-y-8">
            <div className="p-8 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)]">
              <h2 className="font-arcane text-2xl text-gold mb-4 tracking-wider">My Journey</h2>
              <p className="font-celestial text-moon-ivory/80 leading-relaxed">
                For decades, I have walked the boundary between the visible and the unseen. My path began as a seeker of ancient wisdom,
                navigating the labyrinth of hermetic traditions and the silence of the void. Through trial and transformation,
                I learned that the greatest alchemy is not the turning of lead into gold, but the turning of suffering into wisdom.
              </p>
            </div>

            <div className="p-8 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)]">
              <h2 className="font-arcane text-2xl text-gold mb-4 tracking-wider">My Practices</h2>
              <p className="font-celestial text-moon-ivory/80 leading-relaxed">
                My work is a synthesis of diverse lineages: from the precision of Kabbalistic study to the fluidity of Reiki and
                the depth of Shadow Work. I integrate these tools not as rigid systems, but as keys to unlock the individual's
                own innate divinity.
              </p>
            </div>
          </section>

          <section className="space-y-8">
            <div className="p-8 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)]">
              <h2 className="font-arcane text-2xl text-gold mb-4 tracking-wider">Philosophy</h2>
              <p className="font-celestial text-moon-ivory/80 leading-relaxed italic">
                "Explore the unseen without losing yourself in it."
              </p>
              <p className="font-celestial text-moon-ivory/60 mt-4 text-sm leading-relaxed">
                I believe that spiritual growth is not an escape from the world, but a deeper immersion into it.
                To reach Heaven, one must be fully rooted in Earth.
              </p>
            </div>

            <div className="p-8 rounded-[var(--border-radius-lg)] bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)]">
              <h2 className="font-arcane text-2xl text-gold mb-4 tracking-wider">How I Work</h2>
              <p className="font-celestial text-moon-ivory/80 leading-relaxed">
                I do not act as a guru or a source of absolute truth. Instead, I serve as a mirror and a guide.
                My role is to hold the space where you can encounter your own essence and navigate your
                transformation with discernment and grace.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-root via-gold to-crown">
            <div className="px-8 py-4 rounded-full bg-obsidian text-gold font-arcane tracking-widest text-sm">
              GROUNDED IN EARTH • ASCENDING TO HEAVEN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
