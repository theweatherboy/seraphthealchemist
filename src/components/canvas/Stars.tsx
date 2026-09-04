"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';

export default function Stars() {
  const ref = useRef<THREE.Points>(null!);

  // Create a distribution of stars
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    const cols = new Float32Array(3000 * 3);

    for (let i = 0; i < 3000; i++) {
      // Distribute stars in a large sphere around the origin
      const r = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Color stars based on temperature (Gold, Blue, White)
      const rand = Math.random();
      if (rand > 0.9) {
        cols[i * 3] = 1.0; cols[i * 3 + 1] = 0.8; cols[i * 3 + 2] = 0.5; // Gold
      } else if (rand > 0.7) {
        cols[i * 3] = 0.5; cols[i * 3 + 1] = 0.7; cols[i * 3 + 2] = 1.0; // Blue
      } else {
        cols[i * 3] = 1.0; cols[i * 3 + 1] = 1.0; cols[i * 3 + 2] = 1.0; // White
      }
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    // Slow rotation of the celestial sphere
    ref.current.rotation.y += 0.0002;
    ref.current.rotation.x += 0.0001;
  });

  return (
    <Points ref={ref} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        opacity={0.8}
        size={0.1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
