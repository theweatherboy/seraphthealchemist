"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AlchemicalWheel from '@/components/features/AlchemicalWheel';

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="font-arcane text-5xl md:text-7xl text-seraphic-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
          Work With Me
        </h1>
        <p className="font-celestial text-xl text-moon-ivory/60 max-w-2xl mx-auto">
          Step into the circle of transformation. Choose a path that resonates with your current state of being.
        </p>
      </motion.div>

      <div className="w-full flex-grow flex items-center justify-center">
        <AlchemicalWheel />
      </div>

      <footer className="mt-20 text-center max-w-2xl mx-auto">
        <p className="font-celestial text-moon-ivory/60 leading-relaxed italic">
          "Spirituality should not require you to surrender your discernment.
          I provide the framework; you provide the experience."
        </p>
      </footer >
    </div>
  );
}
