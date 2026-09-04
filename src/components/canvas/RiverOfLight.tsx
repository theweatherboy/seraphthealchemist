"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function RiverOfLight() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-30">
      {/* The "River" - Animated SVG Paths */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--color-seraphic-gold)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Multiple flowing streams */}
        {[...Array(5)].map((_, i) => (
          <motion.path
            key={i}
            d={`M -100 ${20 + i * 15}% Q 25% ${10 + i * 15}%, 50% ${20 + i * 15}%, 75% ${30 + i * 15}%, 110% ${20 + i * 15}%`}
            stroke="url(#riverGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathOffset: 1,
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              pathOffset: {
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              },
              opacity: {
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            style={{
              strokeDasharray: '100 400',
              filter: 'blur(2px)'
            }}
          />
        ))}
      </svg>
    </div>
  );
}
