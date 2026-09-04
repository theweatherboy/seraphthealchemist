"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export default function CelestialWheel() {
  const wheelRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);
  const outerRef = useRef<THREE.Group>(null!);

  const rings = [
    { radius: 4, speed: 0.002, color: '#D4AF37', symbols: ['☉', '☽', '♂', '♀', '♃', '♄', '♅', '♆'] },
    { radius: 6, speed: -0.001, color: '#AA8A2E', symbols: ['🜁', '🜂', '🜃', '🜄', '🜔', '🜕', '🜖', '🜗'] },
    { radius: 8, speed: 0.0005, color: '#50C878', symbols: ['★', '✦', '✧', '◈', '◇', '◆', '❖', '❉'] },
  ];

  useFrame(() => {
    if (wheelRef.current) wheelRef.current.rotation.z += 0.001;
    if (innerRef.current) innerRef.current.rotation.z += 0.005;
    if (outerRef.current) outerRef.current.rotation.z -= 0.003;
  });

  return (
    <group ref={wheelRef} rotation={[Math.PI / 2, 0, 0]}>
      {rings.map((ring, ringIdx) => (
        <group key={ringIdx} ref={ringIdx === 0 ? innerRef : ringIdx === 1 ? outerRef : null}>
          {ring.symbols.map((symbol, symIdx) => {
            const angle = (symIdx / ring.symbols.length) * Math.PI * 2;
            return (
              <Text
                key={symIdx}
                position={[Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0]}
                rotation={[0, 0, angle]}
                fontSize={0.4}
                color={ring.color}
                font="https://fonts.gstatic.com/s/cinzel.woff2" // Fallback if available, otherwise standard
              >
                {symbol}
              </Text>
            );
          })}
          {/* The Ring Line */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.radius, 0.02, 16, 100]} />
            <meshStandardMaterial color={ring.color} emissive={ring.color} emissiveIntensity={0.5} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
