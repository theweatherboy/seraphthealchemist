"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, BookOpen, Compass } from 'lucide-react';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

const SITE_SEQUENCE = ['/', '/grimoire', '/services', '/forge', '/support', '/legal', '/contact'];

// In a real app, this would be fetched via a Server Component or API
const GRIMOIRE_DATA = [
  { slug: 'emerald-tablet', title: 'The Emerald Tablet', subject: 'Alchemy', coord: '10, 5, -2' },
  { slug: 'nigredo', title: 'Nigredo', subject: 'Alchemy', coord: '12, -2, 5' },
  { slug: 'albedo', title: 'Albedo', subject: 'Alchemy', coord: '15, 2, 10' },
  { slug: 'rubedo', title: 'Rubedo', subject: 'Alchemy', coord: '18, -5, 15' },
  { slug: 'hermeticism', title: 'Hermeticism', subject: 'Mysticism', coord: '-5, 10, 2' },
  { slug: 'gnosticism', title: 'Gnosticism', subject: 'Mysticism', coord: '-10, 5, -5' },
  { slug: 'seraphic-healing', title: 'Seraphic Healing', subject: 'Angels', coord: '0, 20, 0' },
];

export default function GrimoireIndex() {
  useScrollNavigation(1, SITE_SEQUENCE);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 max-w-6xl mx-auto">
      <header className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-arcane text-5xl md:text-7xl text-seraphic-gold mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            The Grimoire
          </h1>
          <p className="font-celestial text-xl text-moon-ivory/60 max-w-2xl mx-auto">
            An interconnected repository of esoteric knowledge. Each thread is a gateway to a deeper understanding of the hidden architecture.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GRIMOIRE_DATA.map((item, index) => (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, borderColor: '#D4AF37' }}
            className="group relative p-6 bg-void-purple/30 border border-seraphic-gold/20 rounded-lg hover:bg-void-purple/50 transition-all cursor-pointer"
          >
            <Link href={`/grimoire/${item.slug}`} className="block">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-obsidian border border-seraphic-gold/30 rounded-full text-seraphic-gold group-hover:text-ether-teal transition-colors">
                  <BookOpen size={20} />
                </div>
                <span className="text-[10px] font-celestial text-moon-ivory/40 uppercase tracking-tighter">
                  Coord: {item.coord}
                </span>
              </div>

              <h3 className="font-arcane text-2xl text-moon-ivory group-hover:text-seraphic-gold transition-colors mb-2">
                {item.title}
              </h3>
              <p className="font-celestial text-sm text-moon-ivory/60 mb-4">
                {item.subject}
              </p>

              <div className="flex items-center gap-2 text-xs font-celestial text-seraphic-gold opacity-0 group-hover:opacity-100 transition-opacity">
                <Compass size={14} />
                <span>Begin Exploration</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <div className="inline-flex items-center gap-3 p-4 rounded-full bg-obsidian border border-seraphic-gold/30 text-moon-ivory/60 font-celestial text-sm">
          <Sparkles size={16} className="text-seraphic-gold" />
          <span>The knowledge graph is evolving. New threads are being woven.</span>
        </div>
      </div>
    </div>
  );
}
