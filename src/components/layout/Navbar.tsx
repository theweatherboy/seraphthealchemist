"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'ENTER THE SANCTUM', href: '/' },
  { name: 'THE ALCHEMIST', href: '/about' },
  { name: 'WORK WITH ME', href: '/services' },
  { name: 'THE GRIMOIRE', href: '/grimoire' },
  { name: 'THE LIBRARY', href: '/library' },
  { name: 'THE ALCHEMY', href: '/forge' },
  { name: 'ORACLE', href: '/oracle' },
  { name: 'COSMOLOGY', href: '/cosmology' },
  { name: 'SUPPORT THE TEMPLE', href: '/support' },
  { name: 'BEGIN YOUR JOURNEY', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center">
      <Link
        href="/"
        className="font-arcane text-2xl text-seraphic-gold flex items-center gap-2 group"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span>Threads of Divinity</span>
      </Link>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-seraphic-gold hover:text-ether-teal transition-colors focus:outline-none"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-obsidian/95 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-8"
          >
            <div className="flex flex-col items-center gap-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="font-arcane text-3xl text-moon-ivory hover:text-seraphic-gold transition-colors text-center block"
                  >
                    ✦ {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
