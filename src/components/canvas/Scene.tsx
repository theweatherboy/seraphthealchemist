"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, AdaptiveEvents } from '@react-three/drei';

interface SceneProps {
  children: React.ReactNode;
}

export default function Scene({ children }: SceneProps) {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-obsidian">
      <Canvas
        shadows
        dpr={[1, 2]} // Adaptive pixel ratio for performance
        camera={{ position: [0, 0, 5], fov: 75 }}
      >
        <AdaptiveEvents />

        <color attach="background" args={['#0B0B0B']} />

        <PerspectiveCamera makeDefault position={[0, 0, 5]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#50C878" />

        <Suspense fallback={null}>
          {children}
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
