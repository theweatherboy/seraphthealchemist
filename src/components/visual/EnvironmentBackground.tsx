"use client";

import React from 'react';
import { useRealm } from '@/context/RealmContext';
import { motion } from 'framer-motion';

export default function EnvironmentBackground() {
  const { currentRealm } = useRealm();

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Primary Realm Glow */}
      <motion.div
        animate={{
          backgroundColor: currentRealm.color,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 opacity-10 blur-[100px]"
      />

      {/* Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian opacity-80" />

      {/* Subtle Atmospheric Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Dynamic Light Leak based on Realm */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          opacity: [0.1, 0.2, 0.1, 0.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-[120px]"
        style={{ backgroundColor: currentRealm.color }}
      />
    </div>
  );
}
