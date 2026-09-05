"use client";

import React from 'react';
import { motion } from 'framer-motion';

const JOURNEY_STEPS = [
  { label: 'Ground', color: 'from-red-600 to-red-900', description: 'Root into the present moment. Build a strong foundation.', value: '01' },
  { label: 'Protect', color: 'from-orange-500 to-orange-800', description: 'Shield your energy. Clear what no longer serves you.', value: '02' },
  { label: 'Heal', color: 'from-yellow-400 to-yellow-600', description: 'Restore your power. Release. Balance. Recapture your light.', value: '03' },
  { label: 'Balance', color: 'from-green-500 to-green-800', description: 'Balance your energy. Align. Center. Flow with your truth.', value: '04' },
  { label: 'Express', color: 'from-blue-400 to-blue-600', description: 'See clearly. Receive guidance. Speak your truth.', value: '05' },
  { label: 'Awaken', color: 'from-indigo-500 to-indigo-800', description: 'Explore beyond the physical. Journey within.', value: '06' },
  { label: 'Transcend', color: 'from-purple-500 to-purple-900', description: 'Connect with divine wisdom. Remember who you truly are.', value: '07' },
];

export default function JourneySection() {
  return (
    <section className="relative py-32 px-4 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="font-arcane text-4xl md:text-6xl text-seraphic-gold mb-4 tracking-widest">
            THE JOURNEY
          </h2>
          <p className="font-celestial text-moon-ivory/60 max-w-2xl mx-auto">
            From the roots of the earth to the stars above, this is a path of remembrance, transformation, and return.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Connecting Path (SVG) */}
          <div className="absolute inset-0 -z-10 hidden md:block">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <motion.path
                d="M 0 300 Q 200 100 400 300 T 800 300 T 1200 300 T 1600 300"
                stroke="url(#journeyGradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="20%" stopColor="#f59e0b" />
                  <stop offset="40%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#3b82f6" />
                  <stop offset="80%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {JOURNEY_STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${step.color} shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-transform duration-500 group-hover:scale-110 cursor-pointer`}>
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center font-arcane text-2xl text-white drop-shadow-md">
                  {step.value}
                </div>
              </div>

              <div className="mt-6 max-w-[180px]">
                <h3 className="font-arcane text-xl text-seraphic-gold mb-2">{step.label}</h3>
                <p className="font-celestial text-sm text-moon-ivory/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <button className="px-8 py-3 font-arcane text-seraphic-gold border border-seraphic-gold/50 hover:bg-seraphic-gold hover:text-obsidian transition-all duration-300 rounded-full uppercase tracking-widest text-sm">
            Explore the Path
          </button>
        </div>
      </div>
    </section>
  );
}
