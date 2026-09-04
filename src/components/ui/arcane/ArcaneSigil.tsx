"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ArcaneSigilProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ArcaneSigil({
  size = 100,
  color = "var(--color-seraphic-gold)",
  className = ""
}: ArcaneSigilProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      >
        {/* Outer Circle */}
        <circle cx="50" cy="50" r="45" className="opacity-30" />

        {/* Inner Hexagon */}
        <motion.path
          d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* The "Light Thread" - The moving light effect */}
        <motion.path
          d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            stroke: `url(#lightGradient)`,
            filter: 'drop-shadow(0 0 4px var(--color-seraphic-gold))'
          }}
          initial={{ pathLength: 0.2, pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <defs>
          <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--color-seraphic-gold)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
