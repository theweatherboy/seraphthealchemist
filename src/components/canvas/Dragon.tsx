"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import { useRealm } from '@/context/RealmContext';
import * as THREE_CURVE from 'three';

const SEGMENT_COUNT = 16;

export default function Dragon() {
  const { currentRealm } = useRealm();
  const bodyRef = useRef<THREE.Group>(null!);
  const segmentsRef = useRef<THREE.Mesh[]>([]);
  const auraRef = useRef<THREE.Points>(null!);
  const headLightRef = useRef<THREE.PointLight>(null!);

  // Adjust movement speed based on realm
  const baseSpeed = useMemo(() => {
    const speeds: Record<string, number> = {
      earth: 0.06,
      flow: 0.08,
      alchemy: 0.1,
      healing: 0.07,
      knowledge: 0.09,
      oracle: 0.12,
      celestial: 0.15
    };
    return speeds[currentRealm.id] || 0.08;
  }, [currentRealm]);

  // Create a more complex, evolving path
  const path = useMemo(() => {
    return new THREE_CURVE.CatmullRomCurve3([
      new THREE.Vector3(-4, 0, 0),
      new THREE.Vector3(-2, 2, 2),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, -2, 2),
      new THREE.Vector3(4, 0, 0),
      new THREE.Vector3(2, 2, -2),
      new THREE.Vector3(0, 0, -4),
      new THREE.Vector3(-2, -2, -2),
    ], true);
  }, []);

  const particles = useMemo(() => {
    const pos = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Update segments along the path
    segmentsRef.current.forEach((segment, i) => {
      // Flowing movement based on realm speed
      const progress = (t * baseSpeed + i * 0.04) % 1;
      const pos = path.getPointAt(progress);

      // Add some organic "sway" using sine waves
      pos.x += Math.sin(t * 0.5 + i * 0.3) * 0.2;
      pos.y += Math.cos(t * 0.5 + i * 0.3) * 0.2;

      segment.position.copy(pos);
      segment.lookAt(
        path.getPointAt((progress + 0.01) % 1)
      );

      // Tapering body: Head (large) -> Mid (med) -> Tail (small)
      const scale = i === 0 ? 1 : 1 - (i / SEGMENT_COUNT) * 0.8;
      segment.scale.set(scale, scale, scale);
    });

    // Move the light with the head (the 0th segment)
    if (segmentsRef.current[0] && headLightRef.current) {
      headLightRef.current.position.copy(segmentsRef.current[0].position);
      headLightRef.current.color.set(currentRealm.color);
    }

    if (auraRef.current) {
      auraRef.current.rotation.y += 0.002;
      auraRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group>
      {/* Head Light - Illuminates the environment as the dragon passes */}
      <pointLight
        ref={headLightRef}
        distance={10}
        intensity={2}
        color="#D4AF37"
        castShadow
      />

      {/* The Serpentine Body */}
      <group ref={bodyRef}>
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) segmentsRef.current[i] = el; }}
          >
            <sphereGeometry args={[0.3, 32, 32]} />
            <MeshDistortMaterial
              color={i === 0 ? "#F9E2AF" : currentRealm.color}
              speed={2}
              distort={i === 0 ? 0.1 : 0.3}
              radius={1}
              emissive={i === 0 ? "#F9E2AF" : currentRealm.color}
              emissiveIntensity={i === 0 ? 2 : 0.5}
              metalness={1}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* The Luminous Aura / Star Dust */}
      <Points ref={auraRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <PointMaterial
          size={0.04}
          color="#D4AF37"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Points>

      {/* Core Heart of the Dragon */}
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#F9E2AF"
            emissiveIntensity={5}
          />
        </mesh>
      </Float>
    </group>
  );
}
