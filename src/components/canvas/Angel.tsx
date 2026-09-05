"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';

interface AngelProps {
  position?: [number, number, number];
  scale?: number;
}

export default function Angel({ position = [0, 0, 0], scale = 1 }: AngelProps) {
  const wingsRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (wingsRef.current) {
      // Gentle wing flapping motion
      wingsRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position} scale={scale}>
        {/* Core / Essence */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#D4AF37"
            emissive="#D4AF37"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Halo */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}>
          <torusGeometry args={[0.4, 0.02, 16, 100]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1} />
        </mesh>

        {/* Wings */}
        <group ref={wingsRef}>
          {/* Left Wing */}
          <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial
              color="#E8E0CE"
              emissive="#D4AF37"
              emissiveIntensity={0.5}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Right Wing */}
          <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial
              color="#E8E0CE"
              emissive="#D4AF37"
              emissiveIntensity={0.5}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}
