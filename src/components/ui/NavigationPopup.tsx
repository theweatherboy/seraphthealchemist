"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface NavigationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationPopup({ isOpen, onClose }: NavigationPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const hasSeen = localStorage.getItem('hasSeenIntro');
      if (hasSeen) {
        onClose();
      } else {
        localStorage.setItem('hasSeenIntro', 'true');
      }
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-lg w-full bg-void-purple/80 border border-seraphic-gold/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)] backdrop-blur-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-moon-ivory/40 hover:text-seraphic-gold transition-colors"
              aria-label="Close popup"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-seraphic-gold flex items-center justify-center text-seraphic-gold animate-pulse">
                  <span className="text-2xl">✧</span>
                </div>
              </div>

              <h2 className="font-arcane text-3xl text-seraphic-gold mb-4 tracking-wider">
                Welcome to the Sanctum
              </h2>

              <div className="space-y-4 font-celestial text-moon-ivory/80 leading-relaxed">
                <p>
                  You have entered a sacred space for spiritual exploration, alchemy, and transformation.
                </p>
                <p className="italic opacity-70">
                  To navigate the temple, simply drift. Scroll your wheel to descend through the realms,
                  unveiling the threads of divinity as you move.
                </p>
                <div className="pt-4 flex justify-center gap-4 text-sm uppercase tracking-widest text-seraphic-gold/60">
                  <span>✧ Explore ✧</span>
                  <span>✧ Ascend ✧</span>
                  <span>✧ Transform ✧</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-8 px-6 py-2 font-arcane text-seraphic-gold border border-seraphic-gold/50 hover:bg-seraphic-gold hover:text-obsidian transition-all duration-300 rounded-full uppercase tracking-widest text-sm"
              >
                Enter the Experience
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
