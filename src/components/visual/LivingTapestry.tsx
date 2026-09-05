"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useRealm } from '@/context/RealmContext';
import { motion, useSpring } from 'framer-motion';

interface Node {
  x: number;
  y: number;
}

interface Thread {
  id: string;
  startNode: number;
  endNode: number;
  type: 'primary' | 'secondary' | 'tertiary';
  speed: number;
  offset: number;
}

export default function LivingTapestry() {
  const { currentRealm } = useRealm();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Define Anchor Nodes for the tapestry
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
  }, []);

  // 2. Define the Relationship Model (The Weave)
  const threads = useMemo(() => {
    const t: Thread[] = [];
    for (let i = 0; i < nodes.length; i++) {
      // Each node connects to 1-2 others to create a network
      const connections = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < connections; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          t.push({
            id: `${i}-${target}`,
            startNode: i,
            endNode: target,
            type: Math.random() > 0.8 ? 'primary' : Math.random() > 0.6 ? 'secondary' : 'tertiary',
            speed: Math.random() * 0.2 + 0.05,
            offset: Math.random() * Math.PI * 2,
          });
        }
      }
    }
    return t;
  }, [nodes]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg
        className="w-full h-full opacity-40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="threadGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradient for "Light Traveling" along threads */}
          <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--color-gold)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <g filter="url(#threadGlow)">
          {threads.map((thread) => {
            const start = nodes[thread.startNode];
            const end = nodes[thread.endNode];

            // Calculate a dynamic midpoint for organic curvature
            // The midpoint drifts slowly based on time and realm state
            const time = Date.now() * 0.0005;
            const midX = (start.x + end.x) / 2 + Math.sin(time + thread.offset) * 5;
            const midY = (start.y + end.y) / 2 + Math.cos(time + thread.offset) * 5;

            // Determine visual properties based on hierarchy
            const properties = {
              primary: { strokeWidth: 0.8, opacity: 0.4, blur: 0 },
              secondary: { strokeWidth: 0.4, opacity: 0.2, blur: 1 },
              tertiary: { strokeWidth: 0.2, opacity: 0.1, blur: 2 },
            }[thread.type];

            return (
              <ThreadPath
                key={thread.id}
                start={start}
                end={end}
                midX={midX}
                midY={midY}
                color={currentRealm.color}
                strokeWidth={properties.strokeWidth}
                opacity={properties.opacity}
                mousePos={mousePos}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function ThreadPath({ start, end, midX, midY, color, strokeWidth, opacity, mousePos }: any) {
  // Interaction: Calculate distance from mouse to the center of the thread
  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;
  const dist = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);

  // Subtle attraction: bend the midpoint toward the cursor
  const attractionRadius = 20;
  const bendStrength = Math.max(0, (attractionRadius - dist) / attractionRadius);

  const finalMidX = midX + (mousePos.x - centerX) * 0.1 * bendStrength;
  const finalMidY = midY + (mousePos.y - centerY) * 0.1 * bendStrength;

  const d = `M ${start.x} ${start.y} Q ${finalMidX} ${finalMidY}, ${end.x} ${end.y}`;

  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity + (bendStrength * 0.3)} // Brighten on interaction
      className="transition-colors duration-1000"
    />
  );
}
