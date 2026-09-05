"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useRealm } from '@/context/RealmContext';
import { motion } from 'framer-motion';

interface Node {
  x: number;
  y: number;
  isHub: boolean;
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

  // 1. Define Anchor Nodes with Clustering
  const nodes = useMemo(() => {
    const nodeCount = 25;
    const nodes: Node[] = [];

    // Create 3-4 "Hubs" (points of high connectivity)
    const hubs = Array.from({ length: 4 }).map(() => ({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    }));

    for (let i = 0; i < nodeCount; i++) {
      if (i < hubs.length) {
        nodes.push({ ...hubs[i], isHub: true });
      } else {
        // Distribute others around hubs or randomly
        const hub = hubs[Math.floor(Math.random() * hubs.length)];
        const isNearHub = Math.random() > 0.4;
        nodes.push({
          x: isNearHub
            ? hub.x + (Math.random() - 0.5) * 30
            : Math.random() * 100,
          y: isNearHub
            ? hub.y + (Math.random() - 0.5) * 30
            : Math.random() * 100,
          isHub: false,
        });
      }
    }
    return nodes;
  }, []);

  // 2. Define the Relationship Model (The Weave)
  const threads = useMemo(() => {
    const t: Thread[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];

      // Connection logic: distance-based clustering + strategic hubs
      nodes.forEach((nodeB, j) => {
        if (i === j) return;

        const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
        let connect = false;
        let type: Thread['type'] = 'tertiary';

        if (nodeA.isHub && nodeB.isHub && dist < 50) {
          connect = true;
          type = 'primary';
        } else if ((nodeA.isHub || nodeB.isHub) && dist < 30) {
          connect = true;
          type = 'secondary';
        } else if (dist < 15) {
          connect = true;
          type = 'tertiary';
        }

        if (connect) {
          // Prevent duplicate threads (i-j and j-i)
          if (i < j) {
            t.push({
              id: `${i}-${j}`,
              startNode: i,
              endNode: j,
              type,
              speed: Math.random() * 0.2 + 0.05,
              offset: Math.random() * Math.PI * 2,
            });
          }
        }
      });
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
        className="w-full h-full opacity-50"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="threadGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Subtle Gradient for depth */}
          <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-gold)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g filter="url(#threadGlow)">
          {threads.map((thread) => {
            const start = nodes[thread.startNode];
            const end = nodes[thread.endNode];

            const time = Date.now() * 0.0005;

            // Use Cubic Bezier for more organic, sweeping curves
            // We calculate two control points that drift independently
            const cp1X = (start.x + end.x) / 2 + Math.sin(time + thread.offset) * 8;
            const cp1Y = (start.y + end.y) / 2 + Math.cos(time + thread.offset * 1.1) * 8;
            const cp2X = (start.x + end.x) / 2 + Math.cos(time + thread.offset * 1.2) * 8;
            const cp2Y = (start.y + end.y) / 2 + Math.sin(time + thread.offset * 0.9) * 8;

            const properties = {
              primary: { strokeWidth: 0.5, opacity: 0.3 },
              secondary: { strokeWidth: 0.3, opacity: 0.15 },
              tertiary: { strokeWidth: 0.15, opacity: 0.08 },
            }[thread.type];

            return (
              <ThreadPath
                key={thread.id}
                start={start}
                end={end}
                cp1={{ x: cp1X, y: cp1Y }}
                cp2={{ x: cp2X, y: cp2Y }}
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

function ThreadPath({ start, end, cp1, cp2, color, strokeWidth, opacity, mousePos }: any) {
  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;
  const dist = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);

  const attractionRadius = 25;
  const bendStrength = Math.max(0, (attractionRadius - dist) / attractionRadius);

  // Bend control points toward the mouse for a more fluid interaction
  const finalCp1X = cp1.x + (mousePos.x - centerX) * 0.2 * bendStrength;
  const finalCp1Y = cp1.y + (mousePos.y - centerY) * 0.2 * bendStrength;
  const finalCp2X = cp2.x + (mousePos.x - centerX) * 0.2 * bendStrength;
  const finalCp2Y = cp2.y + (mousePos.y - centerY) * 0.2 * bendStrength;

  // Cubic Bezier: M start C cp1, cp2, end
  const d = `M ${start.x} ${start.y} C ${finalCp1X} ${finalCp1Y}, ${finalCp2X} ${finalCp2Y}, ${end.x} ${end.y}`;

  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity + (bendStrength * 0.4)}
      className="transition-colors duration-1000"
    />
  );
}
