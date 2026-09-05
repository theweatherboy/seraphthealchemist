"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Line } from '@react-three/drei';

interface RingConfig {
  radius: number;
  speed: number;
  color: string;
  symbols: string[];
}

const RINGS: RingConfig[] = [
  { radius: 4, speed: 0.002, color: '#D4AF37', symbols: ['☉', '☽', '♂', '♀', '♃', '♄', '♅', '♆'] }, // Seraphic Gold
  { radius: 6, speed: -0.0015, color: '#50C878', symbols: ['🜁', '🜂', '🜃', '🜄', '🜔', '🜕', '🜖', '🜗'] }, // Dragon Emerald
  { radius: 8, speed: 0.001, color: '#651F32', symbols: ['★', '✦', '✧', '◈', '◇', '◆', '❖', '❉'] }, // Blood Garnet
  { radius: 10, speed: -0.0005, color: '#9D8CC7', symbols: ['☿', '♁', '♄', '☽', '☉', '♂', '♀', '♃'] }, // Astral Lavender
  { radius: 12, speed: 0.0008, color: '#3CA6A0', symbols: ['🜁', '🜂', '🜃', '🜄', '🜔', '🜕', '🜖', '🜗'] }, // Ether Teal
];

export default function TapestryWheel() {
  const groupRef = useRef<THREE.Group>(null!);
  const ringsRefs = useRef<(THREE.Group | null)[]>([]);

  // Precompute thread connections
  const threads = useMemo(() => {
    const points: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];

    for (let i = 0; i < RINGS.length - 1; i++) {
      const inner = RINGS[i];
      const outer = RINGS[i + 1];

      // Create some connecting threads between rings
      for (let j = 0; j < 12; j++) {
        const angleStart = (j / 12) * Math.PI * 2;
        const angleEnd = ((j + 1) / 12) * Math.PI * 2 + (Math.random() * 0.5);

        points.push({
          start: new THREE.Vector3(Math.cos(angleStart) * inner.radius, Math.sin(angleStart) * inner.radius, 0),
          end: new THREE.Vector3(Math.cos(angleEnd) * outer.radius, Math.sin(angleEnd) * outer.radius, 0),
          color: inner.color,
        });
      }
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0005;
    }

    ringsRefs.current.forEach((ref, idx) => {
      if (ref) {
        ref.rotation.z += RINGS[idx].speed;
      }
    });
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      {RINGS.map((ring, idx) => (
        <group key={idx} ref={(el) => (ringsRefs.current[idx] = el)}>
          {ring.symbols.map((symbol, symIdx) => {
            const angle = (symIdx / ring.symbols.length) * Math.PI * 2;
            return (
              <Text
                key={symIdx}
                position={[Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0]}
                rotation={[0, 0, angle]}
                fontSize={0.4}
                color={ring.color}
                font="https://fonts.gstatic.com/s/cinzel.woff2"
              >
                {symbol}
              </Text>
            );
          })}

          <mesh>
            <torusGeometry args={[ring.radius, 0.02, 16, 100]} />
            <meshStandardMaterial
              color={ring.color}
              emissive={ring.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      ))}

      {/* The "Tapestry" Threads */}
      {threads.map((thread, idx) => (
        <Line
          key={idx}
          points={[thread.start, thread.end]}
          color={thread.color}
          lineWidth={0.02}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}
