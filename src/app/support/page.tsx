"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Flame } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-seraphic-gold/10 border border-seraphic-gold/30 text-seraphic-gold">
            <Flame size={48} className="animate-bounce" />
          </div>
        </div>

        <h1 className="font-arcane text-5xl md:text-7xl text-seraphic-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
          Feed the Flame
        </h1>

        <p className="font-celestial text-xl text-moon-ivory/80 mb-8 leading-relaxed">
          Threads of Divinity is an evolving body of spiritual education, creative work, research, and practice.
        </p>

        <p className="font-celestial text-lg text-moon-ivory/60 mb-12 leading-relaxed">
          If something here has helped you, inspired you, or opened a door of curiosity, you can support the continued creation of this work.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {['$11', '$22', '$111'].map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05, borderColor: '#D4AF37' }}
              whileTap={{ scale: 0.95 }}
              className="p-6 bg-void-purple/40 border border-seraphic-gold/30 rounded-2xl text-moon-ivory font-arcane text-2xl hover:bg-void-purple/60 transition-all"
            >
              {amount}
            </motion.button>
          ))}
        </div>

        <button className="px-12 py-4 bg-seraphic-gold text-obsidian font-arcane text-xl rounded-full hover:bg-moon-ivory transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]">
          SUPPORT THE WORK
        </button>

        <div className="mt-16 flex items-center justify-center gap-2 text-moon-ivory/40 font-celestial text-sm">
          <Heart size={16} className="text-seraphic-gold" />
          <span>With gratitude and light.</span>
        </div>
      </motion.div>
    </div>
  );
}
