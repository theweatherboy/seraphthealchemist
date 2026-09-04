"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
}

const SERVICES: Service[] = [
  { id: 'seer', title: 'THE SEER', subtitle: 'Intuitive Readings', description: 'Tarot and Oracle readings to uncover the hidden patterns of your current path.', price: '$33 - $222' },
  { id: 'healer', title: 'THE HEALER', subtitle: 'Energetic Alignment', description: 'Seraphic Healing and Reiki to restore balance and purify your subtle bodies.', price: '$175 - $444' },
  { id: 'alchemist', title: 'THE ALCHEMIST', subtitle: 'Deep Transformation', description: 'Intensive shadow work and alchemical transformation sessions.', price: '$333 - $999' },
  { id: 'oracle', title: 'THE ORACLE', subtitle: 'Future Horizons', description: 'Forward-looking divination focusing on potential timelines and cosmic shifts.', price: '$111 - $333' },
  { id: 'journey', title: 'THE JOURNEY', subtitle: 'Spiritual Guidance', description: 'Long-term mentorship for those navigating a profound spiritual awakening.', price: 'Custom' },
  { id: 'goddess', title: 'THE GODDESS', subtitle: 'Divine Feminine', description: 'A specialized journey exploring the archetypes of the Great Mother.', price: '$333' },
];

export default function AlchemicalWheel() {
  const [activeService, setActiveService] = useState<string | null>(null);

  const radius = 280; // Radius of the wheel in pixels

  return (
    <div className="relative flex items-center justify-center h-[600px] w-full max-w-4xl mx-auto">
      {/* The Wheel Base */}
      <div className="absolute w-[560px] h-[560px] rounded-full border-2 border-seraphic-gold/20 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-seraphic-gold/10 pointer-events-none" />

      {/* Center Point */}
      <div className="relative z-10 w-32 h-32 rounded-full bg-obsidian border-4 border-seraphic-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
        <Sparkles className="text-seraphic-gold w-12 h-12 animate-pulse" />
      </div>

      {/* The Services (Arranged in a Circle) */}
      {SERVICES.map((service, index) => {
        const angle = (index / SERVICES.length) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveService(service.id)}
            className="absolute cursor-pointer group"
            style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center text-center p-2 transition-all duration-500 ${activeService === service.id ? 'bg-seraphic-gold text-obsidian border-seraphic-gold scale-110 shadow-[0_0_20px_rgba(212,175,55,0.6)]' : 'bg-obsidian text-seraphic-gold border-seraphic-gold/40 group-hover:border-seraphic-gold'}`}>
              <span className="font-arcane text-xs leading-tight">{service.title}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Service Detail Overlay */}
      <AnimatePresence>
        {activeService && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-void-purple/80 backdrop-blur-lg border border-seraphic-gold/30 rounded-2xl text-center z-20"
          >
            {(() => {
              const service = SERVICES.find(s => s.id === activeService);
              if (!service) return null;
              return (
                <>
                  <h3 className="font-arcane text-2xl text-seraphic-gold mb-1">{service.title}</h3>
                  <p className="font-celestial text-sm text-moon-ivory/60 mb-3 uppercase tracking-widest">{service.subtitle}</p>
                  <p className="font-celestial text-moon-ivory mb-4">{service.description}</p>
                  <div className="flex items-center justify-between border-t border-seraphic-gold/20 pt-4">
                    <span className="font-arcane text-lg text-seraphic-gold">{service.price}</span>
                    <button className="px-4 py-2 bg-seraphic-gold text-obsidian font-arcane rounded-full text-sm hover:bg-moon-ivory transition-colors">
                      BOOK SESSION
                    </button>
                  </div>
                </>
              );
            })()}
            <button
              onClick={() => setActiveService(null)}
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-obsidian border border-seraphic-gold/30 text-seraphic-gold flex items-center justify-center hover:bg-seraphic-gold hover:text-obsidian transition-all"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
