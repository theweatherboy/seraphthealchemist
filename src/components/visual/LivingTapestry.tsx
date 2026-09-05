"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useRealm } from '@/context/RealmContext';
import { motion, useSpring } from 'framer-motion';

interface ThreadProps {
  color: string;
  index: number;
  mousePos: { x: number; y: number };
}

function Thread({ color, index, mousePos }: ThreadProps) {
  // Organic path data - cached with useMemo
  const pathData = useMemo(() => {
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const cp1X = Math.random() * 100;
    const cp1Y = Math.random() * 100;
    const cp2X = Math.random() * 100;
    const cp2Y = Math.random() * 100;
    const endX = Math.random() * 100;
    const endY = Math.random() * 100;
    return {
      d: `M ${startX}% ${startY}% C ${cp1X}% ${cp1Y}%, ${cp2X}% ${cp2Y}%, ${endX}% ${endY}%`,
      startX, startY, endX, endY
    };
  }, []);

  // Interaction: subtly bend the path based on mouse proximity
  // In a real implementation, we'd recalculate the Bézier curve.
  // For a prototype, we'll use a subtle transform shift.
  const springConfig = { damping: 20, stiffness: 100 };
  const offsetX = useSpring(0, springConfig);
  const offsetY = useSpring(0, springConfig);

  useEffect(() => {
    // Simple proximity check: is the mouse near the "center" of this thread?
    // We'll approximate the thread center as the midpoint of start and end.
    const centerX = (pathData.startX + pathData.endX) / 2;
    const centerY = (pathData.startY + pathData.endY) / 2;

    const dist = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);

    if (dist < 20) {
      const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
      offsetX.set(Math.cos(angle) * 2);
      offsetY.set(Math.sin(angle) * 2);
    } else {
      offsetX.set(0);
      offsetY.set(0);
    }
  }, [mousePos, pathData, offsetX, offsetY]);

  return (
    <motion.path
      d={pathData.d}
      stroke={color}
      strokeWidth={Math.random() * 2 + 0.5}
      fill="none"
      opacity={Math.random() * 0.3 + 0.1}
      className="transition-colors duration-1000"
      style={{ x: offsetX, y: offsetY }}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.3 }}
      transition={{ duration: 2 + Math.random() * 2, delay: index * 0.1 }}
    />
  );
}

export default function LivingTapestry() {
  const { currentRealm } = useRealm();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const threadCount = 30;
  const threads = useMemo(() => Array.from({ length: threadCount }), [threadCount]);

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
        className="w-full h-full opacity-60"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)">
          {threads.map((_, i) => (
            <Thread key={i} index={i} color={currentRealm.color} mousePos={mousePos} />
          ))}
        </g>
      </svg>
    </div>
  );
}
